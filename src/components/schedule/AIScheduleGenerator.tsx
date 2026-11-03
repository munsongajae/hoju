"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Loader2,
    ArrowLeft,
    Trash2,
    AlertCircle,
    Save,
    MapPin,
    Clock,
    AlignLeft,
    CalendarDays,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useTrip } from "@/contexts/TripContext";
import { db, generateId } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { differenceInCalendarDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { generateWithGemini, GeminiQuotaError, GeminiDailyLimitError, GeminiTimeoutError } from "@/lib/gemini";
import { parseAiJsonArray } from "@/lib/aiJson";
import { QuotaErrorBanner } from "@/components/ai/QuotaErrorBanner";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { Capacitor } from "@capacitor/core";
import { parseIsoToLocalDate } from "@/lib/localDate";

interface AIScheduleItem {
    id: string;
    day_number: number;
    title: string;
    city: string;
    start_time: string;
    type: "view" | "food" | "move" | "rest" | "shop" | "kids";
    memo: string;
}

interface AIScheduleGeneratorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScheduleImported: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    view: "관광",
    food: "식사",
    move: "이동",
    rest: "휴식",
    shop: "쇼핑",
    kids: "키즈",
};

const TYPE_COLORS: Record<string, string> = {
    view: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    move: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    rest: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    shop: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    kids: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS =
    "pb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))]";

export function AIScheduleGenerator({ open, onOpenChange, onScheduleImported }: AIScheduleGeneratorProps) {
    const { selectedTripId, selectedTrip } = useTrip();
    const { showWithAd } = useInterstitialAd();
    const toast = useToast();
    const { t, i18n } = useTranslation();
    const isEn = (i18n.resolvedLanguage ?? i18n.language ?? "ko").startsWith("en");
    const isNativePlatform = Capacitor.isNativePlatform();

    const [step, setStep] = useState<"configure" | "preview">("configure");

    // Step 1 states
    const [destination, setDestination] = useState(selectedTrip?.cities || "");
    const [startDate, setStartDate] = useState<Date | undefined>(
        selectedTrip?.start_date ? parseIsoToLocalDate(selectedTrip.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        selectedTrip?.end_date ? parseIsoToLocalDate(selectedTrip.end_date) : undefined
    );
    const [companions, setCompanions] = useState("");
    const [style, setStyle] = useState("");
    const [extraRequest, setExtraRequest] = useState("");
    const [minPerDay, setMinPerDay] = useState(3);
    const [maxPerDay, setMaxPerDay] = useState(6);

    // Generation states
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Preview states
    const [previewItems, setPreviewItems] = useState<AIScheduleItem[]>([]);
    const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!open || !selectedTrip) return;

        setStartDate(selectedTrip.start_date ? parseIsoToLocalDate(selectedTrip.start_date) : undefined);
        setEndDate(selectedTrip.end_date ? parseIsoToLocalDate(selectedTrip.end_date) : undefined);
        setDestination(selectedTrip.cities || "");
        setCompanions(
            selectedTrip.family_count ? `${selectedTrip.family_count}인 가족` : ""
        );
    }, [
        open,
        selectedTrip?.start_date,
        selectedTrip?.end_date,
        selectedTrip?.cities,
        selectedTrip?.family_count,
    ]);

    const durationDays = startDate && endDate
        ? differenceInCalendarDays(endDate, startDate) + 1
        : 0;

    const buildPrompt = () => {
        const dayNumbers = durationDays > 0
            ? Array.from({ length: durationDays }, (_, i) => i + 1).join(", ")
            : "1";
        const targetPerDay = Math.round((minPerDay + maxPerDay) / 2);

        // 자연어 입력을 한 줄로 정리해 모델 혼란 방지
        const sanitize = (v: string) => v.replace(/\n/g, " ").trim() || "없음";

        if (isEn) {
            const periodStr = startDate && endDate
                ? `${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")} (${durationDays} day${durationDays !== 1 ? "s" : ""})`
                : `${durationDays} day${durationDays !== 1 ? "s" : ""}`;

            // Few-shot: 중간값(targetPerDay)에 맞춘 예시 생성
            const exampleItems = Array.from({ length: targetPerDay }, (_, i) => {
                const types = ["move", "food", "view", "view", "shop", "rest"];
                const titles = ["Arrive at Airport", "Lunch at Local Cafe", "Visit City Center", "Museum Tour", "Shopping District", "Hotel Check-in"];
                const times = ["09:00", "12:30", "14:00", "15:30", "17:00", "19:00"];
                const memos = [
                    "Clear immigration, pick up luggage, and take airport shuttle to hotel.",
                    "Enjoy regional cuisine at a well-reviewed local restaurant.",
                    "Explore the main square and nearby landmarks on foot.",
                    "Guided tour through the national museum's top exhibits.",
                    "Browse local boutiques and souvenir shops in the main district.",
                    "Check in and rest before evening plans.",
                ];
                return `{"day_number":1,"title":"${titles[i] ?? titles[0]}","city":"Sydney","start_time":"${times[i] ?? "10:00"}","type":"${types[i] ?? "view"}","memo":"${memos[i] ?? memos[0]}"}`;
            }).join(",\n  ");

            return `You are an expert travel planner. Output ONLY a raw JSON array — no markdown, no code fences, no text before or after the array.

TRIP CONDITIONS:
- Destination: ${sanitize(destination)}
- Period: ${periodStr}
- Companions: ${sanitize(companions)}
- Style: ${sanitize(style)}
- Extra: ${sanitize(extraRequest)}

GOAL: Create a rich, satisfying itinerary that covers key highlights of the destination. Aim for around ${targetPerDay} items per day to give travelers a full experience. You may flexibly use ${minPerDay}–${maxPerDay} items per day based on the natural flow of each day.

FORMAT RULES:
1. Start immediately with "[". No text, newline, or space before it.
2. day_number must include every day: [${dayNumbers}]. Do not skip any day.
3. Target ~${targetPerDay} items per day; stay within ${minPerDay}–${maxPerDay}. Lean toward the higher end for popular destinations.
4. "type" must be one of: "view" | "food" | "move" | "rest" | "shop" | "kids" — exactly as written.
5. "start_time" in "HH:MM" (24-hour). Sort items within each day chronologically.
6. "memo": 1–2 informative sentences with a practical tip or highlight.
7. All text (title, city, memo) in English only. Use consistent city spelling throughout.

FIELDS: {"day_number":<int>,"title":<string>,"city":<string>,"start_time":"HH:MM","type":<string>,"memo":<string>}

EXAMPLE (Day 1 with ${targetPerDay} items):
[
  ${exampleItems}
]`;
        }

        const periodStr = startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ~ ${format(endDate, "yyyy-MM-dd")} (${durationDays}일)`
            : `${durationDays}일`;

        // 한국어 예시도 중간값 기준으로 생성
        const koExampleItems = Array.from({ length: targetPerDay }, (_, i) => {
            const types = ["move", "food", "view", "view", "shop", "rest"];
            const titles = ["공항 도착", "현지 맛집 점심", "시내 중심가 탐방", "박물관 관람", "쇼핑 거리", "호텔 체크인"];
            const times = ["09:00", "12:30", "14:00", "15:30", "17:00", "19:00"];
            const memos = [
                "입국 심사 후 수하물 수령. 에어포트링크로 시내 호텔까지 약 30분 소요.",
                "현지인이 즐겨 찾는 레스토랑에서 지역 대표 음식 체험.",
                "도심 광장과 주요 랜드마크를 도보로 둘러보는 오후 코스.",
                "국립 박물관 주요 전시물을 가이드와 함께 관람.",
                "현지 부티크와 기념품 샵이 밀집된 쇼핑 거리 방문.",
                "호텔 체크인 후 저녁 일정 전 휴식.",
            ];
            return `  {"day_number":1,"title":"${titles[i] ?? titles[0]}","city":"시드니","start_time":"${times[i] ?? "10:00"}","type":"${types[i] ?? "view"}","memo":"${memos[i] ?? memos[0]}"}`;
        }).join(",\n");

        return `당신은 전문 여행 플래너입니다. 순수한 JSON 배열만 출력하세요 — 마크다운, 코드펜스, 배열 앞뒤 텍스트 일체 금지.

여행 조건:
- 여행지: ${sanitize(destination)}
- 기간: ${periodStr}
- 동행인: ${sanitize(companions)}
- 스타일: ${sanitize(style)}
- 추가 요청: ${sanitize(extraRequest)}

목표: 여행자가 충분히 만족할 수 있도록 여행지의 핵심 스팟을 포함해 일정을 알차게 구성하세요. 하루 평균 ${targetPerDay}개 내외를 목표로 풍성하게 짜되, 각 날의 흐름에 따라 ${minPerDay}~${maxPerDay}개 사이에서 유동적으로 조절하세요. 인기 여행지라면 최대값에 가깝게 채우세요.

형식 규칙:
1. "[" 로 즉시 시작. 앞에 텍스트·줄바꿈 금지.
2. day_number는 [${dayNumbers}] 전부 포함. 누락 금지.
3. 하루 목표 ${targetPerDay}개 내외, ${minPerDay}~${maxPerDay}개 범위 내. 일정이 풍부할수록 좋음.
4. "type"은 "view", "food", "move", "rest", "shop", "kids" 중 하나만 사용.
5. "start_time"은 "HH:MM" (24시간제). 같은 날 항목은 시간순 정렬.
6. "memo"는 실용적인 팁이나 핵심 정보를 담은 1~2문장으로 작성.
7. "title"·"city"는 한국어로만 표기. 전체에서 동일한 도시 표기 사용.

필드: {"day_number":<정수>,"title":<문자열>,"city":<문자열>,"start_time":"HH:MM","type":<문자열>,"memo":<문자열>}

예시 (1일차, ${targetPerDay}개):
[
${koExampleItems}
]`;
    };

    const parseRawJson = (raw: string): AIScheduleItem[] => {
        const parsed = parseAiJsonArray<any>(raw);
        return parsed.map((item: any, idx: number) => {
            if (!item.title || !item.day_number) {
                throw new Error(`${idx + 1}번째 항목에 필수 필드(title, day_number)가 없습니다.`);
            }
            return {
                ...item,
                id: generateId(),
                type: ["view", "food", "move", "rest", "shop", "kids"].includes(item.type)
                    ? item.type : "view",
            } as AIScheduleItem;
        });
    };

    const handleGenerate = async () => {
        if (!destination.trim()) {
            setGenerateError("여행지를 입력해주세요.");
            return;
        }
        setGenerating(true);
        setGenerateError(null);
        try {
            const output = await generateWithGemini(buildPrompt());
            const items = parseRawJson(output);
            setPreviewItems(items);
            setCollapsedDays(new Set());
            setStep("preview");
        } catch (err: any) {
            if (err instanceof GeminiDailyLimitError) setGenerateError("DAILY_LIMIT");
            else if (err instanceof GeminiQuotaError) setGenerateError("QUOTA_EXCEEDED");
            else if (err instanceof GeminiTimeoutError) setGenerateError(t("ai.error.timeout"));
            else setGenerateError(err?.message || "AI 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        setPreviewItems([]);
        setStep("configure");
    };

    const handleRemoveItem = (id: string) => {
        setPreviewItems(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateItem = (id: string, field: keyof AIScheduleItem, value: any) => {
        setPreviewItems(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
    };

    const toggleDayCollapse = (day: number) => {
        setCollapsedDays(prev => {
            const next = new Set(prev);
            if (next.has(day)) next.delete(day);
            else next.add(day);
            return next;
        });
    };

    const itemsByDay = useMemo(() => {
        const map = new Map<number, AIScheduleItem[]>();
        for (const item of previewItems) {
            if (!map.has(item.day_number)) map.set(item.day_number, []);
            map.get(item.day_number)!.push(item);
        }
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    }, [previewItems]);

    const handleSave = async () => {
        if (!selectedTripId || previewItems.length === 0) return;
        setSaving(true);
        try {
            await db.schedules.bulkAdd(
                previewItems.map(item => ({
                    id: generateId(),
                    trip_id: selectedTripId,
                    title: item.title,
                    day_number: item.day_number,
                    city: item.city,
                    start_time: item.start_time,
                    memo: item.memo,
                    type: item.type,
                    is_completed: false,
                    created_at: new Date().toISOString(),
                }))
            );
            toast.success(`${previewItems.length}개 일정이 저장되었습니다.`);
            onScheduleImported();
            onOpenChange(false);
            setStep("configure");
            setPreviewItems([]);
        } catch {
            toast.error("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setStep("configure");
        setPreviewItems([]);
        setGenerateError(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-[600px] max-h-[88vh] flex flex-col overflow-hidden p-0">
                <DialogHeader className="shrink-0 px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <DialogTitle>
                            {step === "configure" ? "AI 일정 생성" : "생성된 일정 확인"}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {step === "configure"
                            ? "여행 조건을 입력하면 AI가 전체 일정을 자동으로 생성합니다."
                            : `${previewItems.length}개 항목 · 클릭하여 편집 가능`}
                    </DialogDescription>
                </DialogHeader>

                {step === "configure" ? (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-2 min-h-0 space-y-4">
                            {/* 여행지 */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="dst" className="font-semibold">
                                    여행지 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="dst"
                                    placeholder="예: 시드니, 멜버른"
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                />
                            </div>

                            {/* 날짜 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label className="font-semibold">출발일</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                {startDate
                                                    ? format(startDate, "yy.MM.dd (EEE)", { locale: isEn ? enUS : ko })
                                                    : "날짜 선택"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="font-semibold">귀국일</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                {endDate
                                                    ? format(endDate, "yy.MM.dd (EEE)", { locale: isEn ? enUS : ko })
                                                    : "날짜 선택"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* 기간 표시 */}
                            {durationDays > 0 && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary font-medium">
                                    총 {durationDays}일 여행 · 예상 {durationDays * minPerDay}~{durationDays * maxPerDay}개 일정 생성
                                </div>
                            )}

                            {/* 동행인 */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="comp" className="font-semibold">동행인</Label>
                                <Input
                                    id="comp"
                                    placeholder="예: 4인 가족, 아이 2명"
                                    value={companions}
                                    onChange={e => setCompanions(e.target.value)}
                                />
                            </div>

                            {/* 여행 스타일 */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="style" className="font-semibold">여행 스타일</Label>
                                <Input
                                    id="style"
                                    placeholder="예: 맛집 위주, 힐링, 액티비티"
                                    value={style}
                                    onChange={e => setStyle(e.target.value)}
                                />
                            </div>

                            {/* 하루 일정 수 */}
                            <div className="grid gap-2">
                                <Label className="font-semibold">하루 일정 수</Label>
                                <div className="flex items-center gap-4">
                                    {/* 최소 */}
                                    <div className="flex-1 bg-muted/60 rounded-xl p-3 flex flex-col items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">최소</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-full"
                                                onClick={() => setMinPerDay(v => Math.max(1, v - 1))}
                                                disabled={minPerDay <= 1}
                                            >
                                                <span className="text-base leading-none">−</span>
                                            </Button>
                                            <span className="text-xl font-bold w-6 text-center tabular-nums">{minPerDay}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-full"
                                                onClick={() => setMinPerDay(v => Math.min(maxPerDay, v + 1))}
                                                disabled={minPerDay >= maxPerDay}
                                            >
                                                <span className="text-base leading-none">＋</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <span className="text-muted-foreground text-sm font-medium shrink-0">~</span>
                                    {/* 최대 */}
                                    <div className="flex-1 bg-muted/60 rounded-xl p-3 flex flex-col items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">최대</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-full"
                                                onClick={() => setMaxPerDay(v => Math.max(minPerDay, v - 1))}
                                                disabled={maxPerDay <= minPerDay}
                                            >
                                                <span className="text-base leading-none">−</span>
                                            </Button>
                                            <span className="text-xl font-bold w-6 text-center tabular-nums">{maxPerDay}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 rounded-full"
                                                onClick={() => setMaxPerDay(v => Math.min(12, v + 1))}
                                                disabled={maxPerDay >= 12}
                                            >
                                                <span className="text-base leading-none">＋</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    하루에 <span className="font-semibold text-foreground">{minPerDay}~{maxPerDay}개</span> 일정 생성 · 최대 12개
                                </p>
                            </div>

                            {/* 추가 요청 */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="extra" className="font-semibold">추가 요청사항</Label>
                                <Textarea
                                    id="extra"
                                    placeholder="예: 어린이 친화 장소 포함, 오전 일정은 여유롭게"
                                    value={extraRequest}
                                    onChange={e => setExtraRequest(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            {/* 에러 */}
                            {generateError && (
                                generateError === "DAILY_LIMIT" ? <QuotaErrorBanner type="daily" />
                                : generateError === "QUOTA_EXCEEDED" ? <QuotaErrorBanner />
                                : <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {generateError}
                                </div>
                            )}
                        </div>

                        <DialogFooter className={cn(
                            "shrink-0 px-5 py-4 border-t gap-2",
                            isNativePlatform && NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS
                        )}>
                            <Button variant="ghost" onClick={handleClose}>취소</Button>
                            <Button
                                className="gap-1.5 flex-1"
                                onClick={() => showWithAd(handleGenerate)}
                                disabled={generating || !destination.trim()}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        AI 일정 생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        AI로 일정 생성하기
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        {/* Day별 그룹 미리보기 */}
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
                            {itemsByDay.map(([day, items]) => {
                                const isCollapsed = collapsedDays.has(day);
                                return (
                                    <div key={day} className="rounded-xl border bg-card overflow-hidden">
                                        {/* Day 헤더 */}
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 transition-colors"
                                            onClick={() => toggleDayCollapse(day)}
                                        >
                                            <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs shrink-0">
                                                Day {day}
                                            </Badge>
                                            <span className="text-sm font-semibold text-foreground flex-1 text-left">
                                                {items[0]?.city}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{items.length}개</span>
                                            {isCollapsed
                                                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                                        </button>

                                        {/* 항목 목록 */}
                                        {!isCollapsed && (
                                            <div className="divide-y">
                                                {items.map(item => (
                                                    <div key={item.id} className="px-4 py-3 space-y-2 group">
                                                        {/* 제목 + 타입 + 삭제 */}
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                                                                TYPE_COLORS[item.type]
                                                            )}>
                                                                {TYPE_LABELS[item.type] ?? item.type}
                                                            </span>
                                                            <Input
                                                                className="h-7 flex-1 font-semibold border-none bg-transparent hover:bg-muted/60 focus:bg-muted px-1.5 text-sm"
                                                                value={item.title}
                                                                onChange={e => handleUpdateItem(item.id, "title", e.target.value)}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                            </Button>
                                                        </div>

                                                        {/* 시간 + 도시 */}
                                                        <div className="flex items-center gap-4 pl-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Clock className="w-3 h-3 shrink-0" />
                                                                <Input
                                                                    type="time"
                                                                    className="h-6 w-20 border-none bg-transparent p-0 text-xs"
                                                                    value={item.start_time}
                                                                    onChange={e => handleUpdateItem(item.id, "start_time", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <MapPin className="w-3 h-3 shrink-0" />
                                                                <Input
                                                                    className="h-6 border-none bg-transparent p-0 text-xs w-24"
                                                                    value={item.city}
                                                                    onChange={e => handleUpdateItem(item.id, "city", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* 메모 */}
                                                        {item.memo && (
                                                            <div className="flex items-start gap-1.5 pl-1 text-xs text-muted-foreground">
                                                                <AlignLeft className="w-3 h-3 mt-0.5 shrink-0" />
                                                                <Textarea
                                                                    className="min-h-[36px] border-none bg-transparent p-0 resize-none text-xs leading-relaxed"
                                                                    value={item.memo}
                                                                    onChange={e => handleUpdateItem(item.id, "memo", e.target.value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter className={cn(
                            "shrink-0 px-5 py-4 border-t gap-2",
                            isNativePlatform && NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS
                        )}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={handleRegenerate}
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                다시 생성
                            </Button>
                            <Button
                                className="gap-1.5 flex-1"
                                onClick={handleSave}
                                disabled={saving || previewItems.length === 0}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {previewItems.length}개 일정 저장
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

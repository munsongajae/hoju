"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { db, generateId } from "@/lib/db";
import { useTrip } from "@/contexts/TripContext";
import { cn } from "@/lib/utils";
import { generateWithGemini, GeminiQuotaError, GeminiDailyLimitError, GeminiTimeoutError } from "@/lib/gemini";
import { parseAiJsonArray } from "@/lib/aiJson";
import { QuotaErrorBanner } from "@/components/ai/QuotaErrorBanner";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { useTranslation } from "react-i18next";

const TRIP_TYPES = ["가족 여행", "커플 여행", "혼자 여행", "친구 여행"] as const;

interface AiChecklistDialogProps {
    onSuccess: () => void;
    categories: string[];
    tripDays?: number;
}

interface GeneratedGroup {
    category: string;
    items: { text: string; selected: boolean }[];
}

export function AiChecklistDialog({ onSuccess, categories, tripDays }: AiChecklistDialogProps) {
    const { t } = useTranslation();
    const { selectedTripId, selectedTrip } = useTrip();
    const { showWithAd } = useInterstitialAd();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"configure" | "review">("configure");
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>(["가족 여행"]);
    const [generatedGroups, setGeneratedGroups] = useState<GeneratedGroup[]>([]);
    const [error, setError] = useState<string | null>(null);

    const cities = selectedTrip?.cities || "여행지";
    const daysLabel = tripDays ? `${tripDays}박` : "여행";

    const buildPrompt = (tripTypes: string[]) => {
        const tripTypeLabel = tripTypes.join(", ");
        const cityLabel = cities.split(",").map(c => c.trim()).join(", ");
        return `나는 ${cityLabel}로 ${daysLabel}을 가려고 해. 여행 유형: ${tripTypeLabel}.
이 여행을 위한 준비물 체크리스트를 추천해줘.
카테고리별로 나누어서, 각 카테고리마다 5~10개의 항목을 포함해줘.
결과는 반드시 아래의 JSON 배열 형식으로만 출력해야 해. 마크다운(\`\`\`)이나 다른 설명은 절대 포함하지 마.

[
  { "category": "서류/증명", "items": ["여권", "항공권 출력 또는 QR", "해외여행 보험증서"] },
  { "category": "의류/신발", "items": ["속옷 (여행 일수 + 1벌)", "운동화", "샌들"] },
  { "category": "세면도구", "items": ["칫솔/치약", "샴푸/바디워시", "면도기"] }
]`;
    };

    useEffect(() => {
        if (open) {
            setSelectedTripTypes(["가족 여행"]);
            setStep("configure");
            setGeneratedGroups([]);
            setError(null);
        }
    }, [open]);

    const handleTripTypeToggle = (type: string) => {
        setSelectedTripTypes(prev => {
            const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
            return next.length > 0 ? next : prev;
        });
    };

    const handleGenerate = async () => {
        if (!selectedTripId) {
            setError("여행을 선택해주세요.");
            return;
        }
        setGeminiLoading(true);
        setError(null);
        try {
            const result = await generateWithGemini(buildPrompt(selectedTripTypes));
            const parsed = parseAiJsonArray<{ category?: string; items?: unknown }>(result);
            const groups: GeneratedGroup[] = parsed
                .map((group, idx) => {
                    if (!group || typeof group.category !== "string" || !Array.isArray(group.items)) {
                        throw new Error(`${idx + 1}번째 항목 형식이 올바르지 않습니다. (category/items 누락)`);
                    }
                    const items = (group.items as unknown[])
                        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
                        .map((text) => ({ text: text.trim(), selected: true }));
                    return { category: group.category.trim(), items };
                })
                .filter((g) => g.items.length > 0);
            if (groups.length === 0) {
                throw new Error("AI 응답에 유효한 항목이 없습니다.");
            }
            setGeneratedGroups(groups);
            setStep("review");
        } catch (err: any) {
            if (err instanceof GeminiDailyLimitError) setError("DAILY_LIMIT");
            else if (err instanceof GeminiQuotaError) setError("QUOTA_EXCEEDED");
            else if (err instanceof GeminiTimeoutError) setError(t("ai.error.timeout"));
            else setError(`생성 실패: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setGeminiLoading(false);
        }
    };

    const toggleItem = (groupIdx: number, itemIdx: number) => {
        setGeneratedGroups(prev =>
            prev.map((g, gi) =>
                gi !== groupIdx ? g : {
                    ...g,
                    items: g.items.map((item, ii) =>
                        ii !== itemIdx ? item : { ...item, selected: !item.selected }
                    ),
                }
            )
        );
    };

    const toggleGroup = (groupIdx: number) => {
        const allSelected = generatedGroups[groupIdx].items.every(i => i.selected);
        setGeneratedGroups(prev =>
            prev.map((g, gi) =>
                gi !== groupIdx ? g : {
                    ...g,
                    items: g.items.map(item => ({ ...item, selected: !allSelected })),
                }
            )
        );
    };

    const selectedCount = generatedGroups.flatMap(g => g.items).filter(i => i.selected).length;
    const totalCount = generatedGroups.flatMap(g => g.items).length;

    const handleImport = async () => {
        if (!selectedTripId) return;
        setImporting(true);
        setError(null);
        try {
            for (const group of generatedGroups) {
                for (const item of group.items) {
                    if (!item.selected) continue;
                    await db.checklists.add({
                        id: generateId(),
                        title: item.text,
                        category: group.category,
                        is_completed: false,
                        trip_id: selectedTripId,
                        created_at: new Date().toISOString(),
                    });
                }
            }
            onSuccess();
            setOpen(false);
        } catch {
            setError("추가 중 오류가 발생했습니다.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    AI 추천
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[min(90vh,100dvh-1rem)] flex flex-col overflow-hidden p-0">
                <DialogHeader className="shrink-0 px-5 pt-5 pb-3">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        {step === "configure" ? "AI 체크리스트 추천" : "추가할 항목 선택"}
                    </DialogTitle>
                    {step === "review" && (
                        <DialogDescription className="text-xs">
                            원하지 않는 항목은 체크를 해제한 뒤 추가하세요
                        </DialogDescription>
                    )}
                </DialogHeader>

                {step === "configure" ? (
                    <>
                        <div className="flex-1 px-5 py-2 space-y-4">
                            {/* 여행 유형 선택 */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">여행 유형</p>
                                <div className="flex flex-wrap gap-2">
                                    {TRIP_TYPES.map(type => (
                                        <Badge
                                            key={type}
                                            variant={selectedTripTypes.includes(type) ? "default" : "outline"}
                                            className="cursor-pointer select-none px-3 py-1 text-sm"
                                            onClick={() => handleTripTypeToggle(type)}
                                        >
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* 여행 정보 요약 */}
                            <div className="bg-muted/40 rounded-xl px-4 py-3 text-xs space-y-1">
                                <div className="flex gap-2">
                                    <span className="font-semibold text-foreground w-12 shrink-0">여행지</span>
                                    <span className="text-muted-foreground">{cities}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold text-foreground w-12 shrink-0">기간</span>
                                    <span className="text-muted-foreground">{daysLabel}</span>
                                </div>
                            </div>

                            {error && (
                                error === "DAILY_LIMIT" ? <QuotaErrorBanner type="daily" />
                                : error === "QUOTA_EXCEEDED" ? <QuotaErrorBanner />
                                : <p className="text-xs text-destructive bg-destructive/5 rounded-md px-3 py-2">{error}</p>
                            )}
                        </div>

                        <DialogFooter className="shrink-0 px-5 py-4 border-t gap-2">
                            <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
                            <Button
                                className="gap-1.5 flex-1"
                                onClick={() => showWithAd(handleGenerate)}
                                disabled={geminiLoading}
                            >
                                {geminiLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        AI 생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        AI로 생성하기
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        {/* 전체 선택 상태 요약 바 */}
                        <div className="shrink-0 px-5 py-2 bg-muted/30 border-b flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                총 <span className="font-semibold text-foreground">{totalCount}</span>개 항목
                            </span>
                            <button
                                className="text-xs text-primary font-semibold"
                                onClick={() => {
                                    const allSelected = selectedCount === totalCount;
                                    setGeneratedGroups(prev =>
                                        prev.map(g => ({
                                            ...g,
                                            items: g.items.map(item => ({ ...item, selected: !allSelected })),
                                        }))
                                    );
                                }}
                            >
                                {selectedCount === totalCount ? "전체 해제" : "전체 선택"}
                            </button>
                        </div>

                        {/* 항목 목록 */}
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 min-h-0">
                            {generatedGroups.map((group, gi) => {
                                const groupSelectedCount = group.items.filter(i => i.selected).length;
                                const allGroupSelected = groupSelectedCount === group.items.length;
                                const someGroupSelected = groupSelectedCount > 0 && !allGroupSelected;

                                return (
                                    <div key={group.category} className="space-y-1.5">
                                        {/* 카테고리 헤더 */}
                                        <button
                                            className="flex items-center gap-2 w-full text-left"
                                            onClick={() => toggleGroup(gi)}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                                allGroupSelected
                                                    ? "bg-primary border-primary"
                                                    : someGroupSelected
                                                        ? "bg-primary/30 border-primary"
                                                        : "border-muted-foreground/40"
                                            )}>
                                                {allGroupSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                                {someGroupSelected && <div className="w-1.5 h-1.5 bg-primary rounded-sm" />}
                                            </div>
                                            <span className="text-sm font-bold">{group.category}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {groupSelectedCount}/{group.items.length}
                                            </span>
                                        </button>

                                        {/* 항목 리스트 */}
                                        <div className="ml-1 pl-5 border-l-2 border-muted space-y-0.5">
                                            {group.items.map((item, ii) => (
                                                <button
                                                    key={ii}
                                                    className="flex items-center gap-2.5 w-full text-left py-1 rounded-md hover:bg-muted/40 px-1 transition-colors"
                                                    onClick={() => toggleItem(gi, ii)}
                                                >
                                                    <div className={cn(
                                                        "w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                                        item.selected
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground/40"
                                                    )}>
                                                        {item.selected && <Check className="w-2 h-2 text-primary-foreground" />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm",
                                                        !item.selected && "text-muted-foreground line-through"
                                                    )}>
                                                        {item.text}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {error && (
                                error === "DAILY_LIMIT" ? <QuotaErrorBanner type="daily" />
                                : error === "QUOTA_EXCEEDED" ? <QuotaErrorBanner />
                                : <p className="text-xs text-destructive bg-destructive/5 rounded-md px-3 py-2">{error}</p>
                            )}
                        </div>

                        <DialogFooter className="shrink-0 px-5 py-4 border-t gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setStep("configure"); setError(null); }}
                                className="gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                다시 설정
                            </Button>
                            <Button
                                className="gap-1.5 flex-1"
                                onClick={handleImport}
                                disabled={importing || selectedCount === 0}
                            >
                                {importing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCheck className="w-4 h-4" />
                                )}
                                {selectedCount}개 추가하기
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

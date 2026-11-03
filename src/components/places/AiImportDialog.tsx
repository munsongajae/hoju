"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sparkles,
    Loader2,
    RefreshCw,
    MapPin,
    Star,
    Clock,
    Phone,
    Globe,
    Save,
    CheckCheck,
} from "lucide-react";
import { db, generateId } from "@/lib/db";
import { useTrip } from "@/contexts/TripContext";
import { useTranslation } from "react-i18next";
import { generateWithGemini, GeminiQuotaError, GeminiDailyLimitError, GeminiTimeoutError } from "@/lib/gemini";
import { extractAndNormalizeJson } from "@/lib/aiJson";
import { QuotaErrorBanner } from "@/components/ai/QuotaErrorBanner";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Capacitor } from "@capacitor/core";
import { ToastContainer } from "@/components/ui/toast";

const CATEGORY_LABELS: Record<string, string> = {
    tour: "관광지",
    food: "맛집",
    shop: "쇼핑",
    medical: "의료",
    play: "놀이",
    museum: "전시",
    market: "시장",
};

const CATEGORY_COLORS: Record<string, string> = {
    tour: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    shop: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    medical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    play: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    museum: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    market: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);
const VALID_CATEGORIES = ALL_CATEGORIES;
const NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS =
    "pb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))]";

interface GeneratedPlace {
    id: string;
    name: string;
    category: string;
    city: string;
    rating: number;
    address: string;
    notes: string;
    operating_hours: string;
    contact_phone: string;
    website_url: string;
    google_map_url: string;
}

interface AiImportDialogProps {
    onImportSuccess: () => void;
}

export function AiImportDialog({ onImportSuccess }: AiImportDialogProps) {
    const { selectedTripId, selectedTrip } = useTrip();
    const { showWithAd } = useInterstitialAd();
    const toast = useToast();
    const { t, i18n } = useTranslation();
    const isEn = (i18n.resolvedLanguage ?? i18n.language ?? "ko").startsWith("en");
    const isNativePlatform = Capacitor.isNativePlatform();

    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"configure" | "preview">("configure");

    const validTripCities = useMemo(() => {
        const raw = selectedTrip?.cities || (isEn ? "Sydney, Melbourne" : "시드니, 멜버른");
        return raw.split(",").map((c) => c.trim()).filter(Boolean);
    }, [selectedTrip?.cities, isEn]);

    // 설정 상태
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);
    const [placeCount, setPlaceCount] = useState(10);

    // 생성/저장 상태
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // 미리보기 상태
    const [generatedPlaces, setGeneratedPlaces] = useState<GeneratedPlace[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open) {
            setSelectedCities(validTripCities);
            setSelectedCategories(ALL_CATEGORIES);
            setPlaceCount(10);
            setStep("configure");
            setGeneratedPlaces([]);
            setSelectedIds(new Set());
            setGenerateError(null);
        }
    }, [open, validTripCities]);

    const buildPrompt = () => {
        const catLabels = selectedCategories
            .map((c) => (isEn ? c : CATEGORY_LABELS[c]))
            .join(", ");
        const cityList = selectedCities.length > 0
            ? selectedCities.join(", ")
            : (isEn ? "Sydney" : "시드니");

        if (isEn) {
            return `You are a travel expert. Output ONLY a raw JSON array — no markdown, no code fences, no text before or after.

TRIP CONDITIONS:
- Cities: ${cityList}
- Categories: ${catLabels}
- Count: exactly ${placeCount} places total

FORMAT RULES:
1. Start immediately with "[". No text before it.
2. Recommend exactly ${placeCount} real, well-known places across the listed cities.
3. Spread places proportionally across all requested categories.
4. "category" must be exactly one of: tour | food | play | shop | museum | medical | market
5. "rating" must be a number between 1 and 5.
6. "city" must use consistent English spelling matching the trip cities: ${cityList}
7. All text fields in English only.

FIELDS: {"name":<string>,"category":<string>,"city":<string>,"rating":<number>,"address":<string>,"notes":<string>,"operating_hours":<string>,"contact_phone":<string>,"website_url":<string>,"google_map_url":<string>}

EXAMPLE (2 items):
[{"name":"Sydney Opera House","category":"tour","city":"Sydney","rating":5,"address":"Bennelong Point, Sydney NSW 2000","notes":"World-famous performing arts venue with guided tours available daily.","operating_hours":"09:00 - 17:00","contact_phone":"+61 2 9250 7111","website_url":"https://www.sydneyoperahouse.com","google_map_url":"https://www.google.com/maps/search/Sydney+Opera+House"},
{"name":"Rockpool Bar & Grill","category":"food","city":"Sydney","rating":5,"address":"66 Hunter St, Sydney NSW 2000","notes":"Award-winning steakhouse known for premium Australian beef.","operating_hours":"12:00 - 22:00","contact_phone":"+61 2 8078 1900","website_url":"https://www.rockpool.com","google_map_url":"https://www.google.com/maps/search/Rockpool+Bar+Grill+Sydney"}]`;
        }

        return `당신은 여행 전문가입니다. 순수한 JSON 배열만 출력하세요 — 마크다운, 코드펜스, 배열 앞뒤 텍스트 일체 금지.

여행 조건:
- 도시: ${cityList}
- 카테고리: ${catLabels}
- 장소 수: 총 정확히 ${placeCount}곳

형식 규칙:
1. "[" 로 즉시 시작. 앞에 텍스트·줄바꿈 금지.
2. 실제 존재하는 유명 장소 정확히 ${placeCount}곳을 추천. 임의로 지어내지 말 것.
3. 요청한 카테고리들에 골고루 분배.
4. "category"는 tour | food | play | shop | museum | medical | market 중 정확히 하나.
5. "rating"은 1~5 사이의 숫자.
6. "city"는 여행 도시와 동일한 표기 사용: ${cityList}
7. "name"은 한글명(영문명) 형식으로 작성 (예: 오페라하우스(Sydney Opera House)).
8. "google_map_url"은 실제 유효한 구글맵 URL 형식으로.

필드: {"name":<문자열>,"category":<문자열>,"city":<문자열>,"rating":<숫자>,"address":<문자열>,"notes":<문자열>,"operating_hours":<문자열>,"contact_phone":<문자열>,"website_url":<문자열>,"google_map_url":<문자열>}

예시 (2개):
[{"name":"오페라하우스(Sydney Opera House)","category":"tour","city":"시드니","rating":5,"address":"Bennelong Point, Sydney NSW 2000","notes":"세계적으로 유명한 공연 예술 센터. 매일 가이드 투어 운영.","operating_hours":"09:00 - 17:00","contact_phone":"+61 2 9250 7111","website_url":"https://www.sydneyoperahouse.com","google_map_url":"https://www.google.com/maps/search/Sydney+Opera+House"},
{"name":"록풀 바&그릴(Rockpool Bar & Grill)","category":"food","city":"시드니","rating":5,"address":"66 Hunter St, Sydney NSW 2000","notes":"호주 최고급 스테이크하우스. 프리미엄 호주산 소고기 전문.","operating_hours":"12:00 - 22:00","contact_phone":"+61 2 8078 1900","website_url":"https://www.rockpool.com","google_map_url":"https://www.google.com/maps/search/Rockpool+Bar+Grill+Sydney"}]`;
    };

    const parseRaw = (raw: string): GeneratedPlace[] => {
        // 마크다운 링크 [텍스트](URL) → URL, 이스케이프된 underscore 정리는 공통 정규화 전에 처리.
        const preProcessed = raw
            .replace(/\\_/g, "_")
            .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\n]+)\)/gi, "$2");
        const normalized = extractAndNormalizeJson(preProcessed, "array");

        let parsed: unknown;
        try {
            parsed = JSON.parse(normalized);
        } catch (err) {
            throw new Error(
                `AI 응답을 JSON으로 해석할 수 없습니다. ${err instanceof Error ? err.message : ""}`.trim(),
            );
        }
        if (!Array.isArray(parsed)) throw new Error("AI 응답이 JSON 배열 형식이어야 합니다.");

        const result = (parsed as any[])
            .filter((p) => p && typeof p === "object" && typeof p.name === "string" && p.name.trim())
            .map((p: any) => ({
                id: generateId(),
                name: String(p.name).trim(),
                category: VALID_CATEGORIES.includes(p.category) ? p.category : "tour",
                city: typeof p.city === "string" && p.city.trim() ? p.city.trim() : (selectedCities[0] ?? ""),
                rating: Math.min(5, Math.max(1, Number(p.rating) || 4)),
                address: typeof p.address === "string" ? p.address : "",
                notes: typeof p.notes === "string" ? p.notes : "",
                operating_hours: typeof p.operating_hours === "string" ? p.operating_hours : "",
                contact_phone: typeof p.contact_phone === "string" ? p.contact_phone : "",
                website_url: typeof p.website_url === "string" ? p.website_url : "",
                google_map_url: typeof p.google_map_url === "string" ? p.google_map_url : "",
            }));

        if (result.length === 0) {
            throw new Error("AI 응답에 유효한 장소가 없습니다.");
        }
        return result;
    };

    const normalizeIdentity = (value: string) =>
        value
            .normalize("NFKC")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    const makePlaceIdentityKey = (name: string, city: string) => {
        const normalizedName = normalizeIdentity(name);
        const normalizedCity = normalizeIdentity(city);
        return `${normalizedName}::${normalizedCity}`;
    };

    const handleGenerate = async () => {
        if (!selectedTripId) {
            setGenerateError("먼저 여행을 선택해주세요.");
            return;
        }
        setGenerating(true);
        setGenerateError(null);
        try {
            const raw = await generateWithGemini(buildPrompt());
            const places = parseRaw(raw);
            setGeneratedPlaces(places);
            setSelectedIds(new Set(places.map((p) => p.id)));
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

    const handleSave = async () => {
        if (!selectedTripId) return;
        const toSave = generatedPlaces.filter((p) => selectedIds.has(p.id));
        if (toSave.length === 0) return;
        setSaving(true);
        const now = new Date().toISOString();
        try {
            const existingPlaces = await db.places.where("trip_id").equals(selectedTripId).toArray();
            const existingKeys = new Set(
                existingPlaces.map((place) => makePlaceIdentityKey(place.name || "", place.city || ""))
            );
            const dedupeKeys = new Set(existingKeys);

            const uniquePlaces = toSave.filter((place) => {
                const key = makePlaceIdentityKey(place.name, place.city);
                if (!key || dedupeKeys.has(key)) return false;
                dedupeKeys.add(key);
                return true;
            });

            const skippedCount = toSave.length - uniquePlaces.length;
            if (uniquePlaces.length === 0) {
                toast.warning("선택한 장소가 모두 기존 장소와 중복되어 추가되지 않았습니다.");
                return;
            }

            await db.places.bulkAdd(
                uniquePlaces.map((p) => ({
                    id: p.id,
                    trip_id: selectedTripId,
                    name: p.name,
                    category: p.category,
                    city: p.city,
                    rating: p.rating,
                    is_kid_friendly: false,
                    notes: p.notes,
                    address: p.address,
                    operating_hours: p.operating_hours,
                    contact_phone: p.contact_phone,
                    website_url: p.website_url,
                    google_map_url: p.google_map_url,
                    is_favorite: false,
                    created_at: now,
                }))
            );

            if (skippedCount > 0) {
                toast.info(`중복 장소 ${skippedCount}개를 제외하고 ${uniquePlaces.length}개를 추가했습니다.`);
            } else {
                toast.success(`${uniquePlaces.length}개 장소를 추가했습니다.`);
            }
            onImportSuccess();
            setOpen(false);
        } catch {
            setGenerateError("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === generatedPlaces.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(generatedPlaces.map((p) => p.id)));
    };

    const selectedCount = selectedIds.size;

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {t("ai.place.addButton")}
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-1rem)] max-w-[500px] max-h-[88vh] flex flex-col overflow-hidden p-0">
                <DialogHeader className="shrink-0 px-5 pt-5 pb-3">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {step === "configure" ? "AI 장소 추천" : "추천 장소 확인"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "configure"
                            ? "도시·카테고리·수량을 설정하면 AI가 장소를 추천합니다."
                            : `${generatedPlaces.length}개 추천 · 추가할 장소를 선택하세요`}
                    </DialogDescription>
                </DialogHeader>

                {step === "configure" ? (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 min-h-0">
                            {/* 도시 */}
                            <div className="space-y-2">
                                <span className="text-sm font-semibold">도시</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {validTripCities.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() =>
                                                setSelectedCities((prev) =>
                                                    prev.includes(city)
                                                        ? prev.filter((c) => c !== city)
                                                        : [...prev, city]
                                                )
                                            }
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                selectedCities.includes(city)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                            )}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 카테고리 */}
                            <div className="space-y-2">
                                <span className="text-sm font-semibold">카테고리</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() =>
                                                setSelectedCategories((prev) =>
                                                    prev.includes(cat)
                                                        ? prev.filter((c) => c !== cat)
                                                        : [...prev, cat]
                                                )
                                            }
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                selectedCategories.includes(cat)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                            )}
                                        >
                                            {CATEGORY_LABELS[cat]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 장소 수 */}
                            <div className="space-y-2">
                                <span className="text-sm font-semibold">추천 장소 수</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7 rounded-full"
                                            onClick={() => setPlaceCount((v) => Math.max(1, v - 1))}
                                            disabled={placeCount <= 1}
                                        >
                                            <span className="text-base leading-none">−</span>
                                        </Button>
                                        <span className="text-xl font-bold w-8 text-center tabular-nums">{placeCount}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7 rounded-full"
                                            onClick={() => setPlaceCount((v) => Math.min(30, v + 1))}
                                            disabled={placeCount >= 30}
                                        >
                                            <span className="text-base leading-none">＋</span>
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">최대 30개</span>
                                </div>
                            </div>

                            {generateError && (
                                generateError === "DAILY_LIMIT" ? <QuotaErrorBanner type="daily" />
                                : generateError === "QUOTA_EXCEEDED" ? <QuotaErrorBanner />
                                : <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                                    {generateError}
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            "shrink-0 px-5 py-4 border-t flex gap-2",
                            isNativePlatform && NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS
                        )}>
                            <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
                            <Button
                                className="flex-1 gap-1.5"
                                onClick={() => showWithAd(handleGenerate)}
                                disabled={generating || selectedCities.length === 0 || selectedCategories.length === 0}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        AI 생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        AI로 장소 추천받기
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* 전체 선택/해제 바 */}
                        <div className="shrink-0 px-5 py-2 border-b flex items-center justify-between bg-muted/30">
                            <button
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                onClick={toggleSelectAll}
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                {selectedIds.size === generatedPlaces.length ? "전체 해제" : "전체 선택"}
                            </button>
                            <span className="text-xs text-muted-foreground">
                                {selectedCount}/{generatedPlaces.length}개 선택
                            </span>
                        </div>

                        {/* 장소 목록 */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
                            {generatedPlaces.map((place) => {
                                const isSelected = selectedIds.has(place.id);
                                return (
                                    <div
                                        key={place.id}
                                        onClick={() => toggleSelect(place.id)}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                                            isSelected
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-border bg-card opacity-60"
                                        )}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleSelect(place.id)}
                                            className="mt-0.5 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                                                    CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"
                                                )}>
                                                    {CATEGORY_LABELS[place.category] ?? place.category}
                                                </span>
                                                <span className="text-sm font-semibold leading-tight">{place.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-0.5">
                                                    <MapPin className="w-3 h-3" />{place.city}
                                                </span>
                                                <span className="flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating}
                                                </span>
                                            </div>
                                            {place.notes && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">{place.notes}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                {place.operating_hours && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock className="w-3 h-3" />{place.operating_hours}
                                                    </span>
                                                )}
                                                {place.contact_phone && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Phone className="w-3 h-3" />{place.contact_phone}
                                                    </span>
                                                )}
                                                {place.website_url && (
                                                    <span className="flex items-center gap-0.5 text-primary truncate max-w-[140px]">
                                                        <Globe className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{place.website_url.replace(/^https?:\/\//, "")}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={cn(
                            "shrink-0 px-5 py-4 border-t flex gap-2",
                            isNativePlatform && NATIVE_AD_OVERLAY_FOOTER_PADDING_CLASS
                        )}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => { setStep("configure"); setGeneratedPlaces([]); }}
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                다시 생성
                            </Button>
                            <Button
                                className="flex-1 gap-1.5"
                                onClick={handleSave}
                                disabled={saving || selectedCount === 0}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {selectedCount}개 장소 추가
                            </Button>
                        </div>
                    </>
                )}
                </DialogContent>
            </Dialog>
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </>
    );
}

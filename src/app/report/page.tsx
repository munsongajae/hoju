"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Share2, Loader2, Calendar, CreditCard, MapPin, ChevronDown, ChevronRight, Users, Clock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { useTrip } from "@/contexts/TripContext";
import { shareText } from "@/lib/shareUtils";
import { fetchMultipleRates } from "@/lib/exchangeRate";
import { format } from "date-fns";
import { formatLocalDateYYYYMMDD, parseIsoToLocalDate, parseStoredDateToLocal } from "@/lib/localDate";
import { getTripTotalDays } from "@/lib/tripDay";

const CAT_LABELS: Record<string, string> = {
    food: "식비", transport: "교통", lodging: "숙박",
    activity: "관광", shopping: "쇼핑", etc: "기타",
};
const CAT_COLORS: Record<string, string> = {
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    lodging: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    activity: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shopping: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    etc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};
const CURRENCY_SYMBOL: Record<string, string> = {
    AUD: "A$", USD: "US$", KRW: "₩", JPY: "¥", EUR: "€",
    GBP: "£", THB: "฿", VND: "₫", SGD: "S$", HKD: "HK$", TWD: "NT$",
    MYR: "RM", CNY: "¥", NZD: "NZ$",
};
const TYPE_EMOJI: Record<string, string> = {
    view: "🏛", food: "🍽", move: "🚗", rest: "🛌", shop: "🛍", kids: "🎡",
};

export default function ReportPage() {
    const { selectedTrip, selectedTripId } = useTrip();
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    const [schedules, setSchedules] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [places, setPlaces] = useState<any[]>([]);
    const [checklists, setChecklists] = useState<any[]>([]);
    const [diaries, setDiaries] = useState<any[]>([]);
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [loadingRates, setLoadingRates] = useState(false);

    // 접기 상태
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        summary: true,
        expenses_summary: true,
        cat_chart: false,
        schedules: false,
        expenses_detail: false,
        diaries: false,
    });

    const toggle = (key: string) =>
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    useEffect(() => {
        if (selectedTripId) loadAllData();
        else setLoading(false);
    }, [selectedTripId]);

    async function loadAllData() {
        setLoading(true);
        try {
            const [sc, ex, pl, ch, di] = await Promise.all([
                db.schedules.where("trip_id").equals(selectedTripId!).toArray(),
                db.expenses.where("trip_id").equals(selectedTripId!).toArray(),
                db.places.where("trip_id").equals(selectedTripId!).toArray(),
                db.checklists.where("trip_id").equals(selectedTripId!).toArray(),
                db.diaries.where("trip_id").equals(selectedTripId!).toArray(),
            ]);
            
            // Collect currencies for exchange rates
            const currencies = Array.from(new Set(ex.map(e => e.currency || "AUD"))).filter(c => c !== 'KRW');
            if (currencies.length > 0) {
                setLoadingRates(true);
                fetchMultipleRates(currencies)
                    .then(rates => setExchangeRates(rates))
                    .catch(err => console.error(err))
                    .finally(() => setLoadingRates(false));
            }

            // 일정 정렬: day_number → start_time
            sc.sort((a, b) => a.day_number - b.day_number || (a.start_time || "").localeCompare(b.start_time || ""));
            // 지출 정렬: date desc
            ex.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            // 일기 정렬: date desc
            di.sort((a, b) => new Date(b.date ?? b.created_at ?? 0).getTime() - new Date(a.date ?? a.created_at ?? 0).getTime());
            setSchedules(sc); setExpenses(ex); setPlaces(pl);
            setChecklists(ch); setDiaries(di);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const tripDays = useMemo(() => {
        if (!selectedTrip?.start_date || !selectedTrip?.end_date) return 0;
        return getTripTotalDays(
            parseIsoToLocalDate(selectedTrip.start_date),
            parseIsoToLocalDate(selectedTrip.end_date),
        );
    }, [selectedTrip]);

    const cities = useMemo(() =>
        selectedTrip?.cities?.split(",").map(c => c.trim()).filter(Boolean) ?? [],
        [selectedTrip]);

    const expensesByCurrency = useMemo(() => {
        const t: Record<string, number> = {};
        expenses.forEach(e => { const c = e.currency || "AUD"; t[c] = (t[c] || 0) + e.amount; });
        return t;
    }, [expenses]);

    const expensesByCategory = useMemo(() => {
        const t: Record<string, number> = {};
        expenses.forEach(e => { 
            const cur = e.currency || "AUD";
            const rate = cur === 'KRW' ? 1 : (exchangeRates[cur] || (cur === 'AUD' ? 900 : 1));
            const amountKRW = e.amount * rate;
            t[e.category] = (t[e.category] || 0) + amountKRW; 
        });
        return Object.entries(t).sort(([, a], [, b]) => b - a);
    }, [expenses, exchangeRates]);

    // 총 지출 (KRW 환산)
    const totalSpentKRW = useMemo(() => {
        let total = 0;
        expenses.forEach(e => {
            const cur = e.currency || "AUD";
            const rate = cur === 'KRW' ? 1 : (exchangeRates[cur] || (cur === 'AUD' ? 900 : 1));
            total += e.amount * rate;
        });
        return total;
    }, [expenses, exchangeRates]);

    // 일정 날짜별 그룹
    const schedulesByDay = useMemo(() => {
        const d: Record<number, any[]> = {};
        schedules.forEach(s => { if (!d[s.day_number]) d[s.day_number] = []; d[s.day_number].push(s); });
        return d;
    }, [schedules]);

    // 지출 날짜별 그룹 (저장 형식이 어떻든 사용자 의도된 로컬 날짜로 그룹)
    const expensesByDate = useMemo(() => {
        const d: Record<string, any[]> = {};
        expenses.forEach(e => {
            const key = e.date
                ? formatLocalDateYYYYMMDD(parseStoredDateToLocal(e.date))
                : "날짜 없음";
            if (!d[key]) d[key] = [];
            d[key].push(e);
        });
        return Object.entries(d).sort(([a], [b]) => a.localeCompare(b));
    }, [expenses]);

    const completedSchedules = schedules.filter(s => s.is_completed).length;
    const totalExpAmt = Object.values(expensesByCurrency).reduce((a, b) => a + b, 0);
    const schedComplPct = schedules.length > 0 ? Math.round((completedSchedules / schedules.length) * 100) : 0;

    const generateReportText = () => {
        if (!selectedTrip) return "";
        const sep = "─".repeat(30);
        const lines = [
            `📋 ${selectedTrip.title} 여행 리포트`,
            `📅 ${selectedTrip.start_date} ~ ${selectedTrip.end_date} (${tripDays}일)`,
            `🏙️ 방문 도시: ${cities.join(", ") || "미설정"}`,
            `👨‍👩‍👧‍👦 인원: ${selectedTrip.family_count || 1}명`, sep,
            `\n📅 일정 (총 ${schedules.length}개, 완료 ${completedSchedules}개)`,
            ...schedules.map(s => `  ${s.is_completed ? "✅" : "⬜"} Day${s.day_number} ${s.start_time?.slice(0,5) || ""} ${s.title}`),
            sep,
            `\n💰 지출 (총 ₩${Math.round(totalSpentKRW).toLocaleString()})`,
            ...Object.entries(expensesByCurrency).map(([c, a]) => `  ${CURRENCY_SYMBOL[c] || c} ${a.toLocaleString()}`),
            ...expenses.map(e => {
                const day = e.date ? formatLocalDateYYYYMMDD(parseStoredDateToLocal(e.date)) : "";
                return `  ${day} | ${CAT_LABELS[e.category]||e.category} | ${CURRENCY_SYMBOL[e.currency]||e.currency}${e.amount.toLocaleString()} | ${e.title}`;
            }),
            sep,
            `\n📖 일기 (${diaries.length}편)`,
            ...diaries.flatMap(d => [
                `\n  📅 ${d.date ? formatLocalDateYYYYMMDD(parseStoredDateToLocal(d.date)) : ""} — ${d.title || "(제목없음)"}`,
                d.content ? `  ${d.content}` : "",
            ]),
            sep,
            `\n📍 저장 장소 ${places.length}곳`,
            `\n${sep}`,
            "📱 J 여관 앱으로 관리중",
        ];
        return lines.join("\n");
    };

    const handleShare = async () => {
        setSharing(true);
        try { await shareText(`${selectedTrip?.title} 리포트`, generateReportText()); }
        finally { setSharing(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (!selectedTrip) return (
        <div className="p-4 text-center py-20 text-muted-foreground">
            <p>여행을 선택해주세요.</p>
        </div>
    );

    return (
        <div className="p-3 pb-28 space-y-2">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-xl font-bold">여행 리포트</h1>
                </div>
                <Button onClick={handleShare} disabled={sharing} size="sm" className="h-8 gap-1.5">
                    {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                    공유
                </Button>
            </div>

            {/* ① 여행 기본 정보 */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 space-y-1">
                <p className="font-bold text-base leading-tight">{selectedTrip.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedTrip.start_date} ~ {selectedTrip.end_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tripDays}일</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selectedTrip.family_count || 1}명</span>
                </div>
                {cities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {cities.map(c => <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>)}
                    </div>
                )}
            </div>

            {/* ② 3개 미니 통계 (체크리스트 제거) */}
            <div className="grid grid-cols-3 gap-1.5">
                <MiniStat icon="📅" label="일정" value={`${schedules.length}`} sub={`완료 ${completedSchedules}`} />
                <MiniStat icon="💰" label="지출" value={`${expenses.length}건`} sub={`${Object.keys(expensesByCurrency).length}통화`} />
                <MiniStat icon="📖" label="일기" value={`${diaries.length}편`} sub={`장소 ${places.length}곳`} />
            </div>

            {/* ③ 지출 요약 (접기) */}
            <Accordion title="💰 지출 요약" count={expenses.length > 0 ? `총 ≈ ₩${Math.round(totalSpentKRW).toLocaleString()}` : undefined} open={openSections.expenses_summary} onToggle={() => toggle("expenses_summary")}>
                {Object.entries(expensesByCurrency).length === 0 ? (
                    <p className="text-xs text-muted-foreground">지출 내역이 없습니다.</p>
                ) : (
                    <div className="space-y-1">
                        <div className="flex justify-between items-center bg-primary/5 px-2 py-1 rounded text-sm mb-1">
                            <span className="font-bold text-primary">총 지출 합계 (KRW)</span>
                            <span className="font-bold text-primary tabular-nums">≈ ₩ {Math.round(totalSpentKRW).toLocaleString()}</span>
                        </div>
                        {Object.entries(expensesByCurrency).map(([cur, amt]) => (
                            <div key={cur} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{cur}</span>
                                <span className="font-semibold tabular-nums">{CURRENCY_SYMBOL[cur] || cur} {Math.round(amt).toLocaleString()}</span>
                            </div>
                        ))}
                        {selectedTrip.family_count && selectedTrip.family_count > 1 && (
                            <div className="pt-1 mt-1 border-t space-y-0.5">
                                <p className="text-[11px] text-muted-foreground">1인당</p>
                                {Object.entries(expensesByCurrency).map(([cur, amt]) => (
                                    <div key={cur} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">{cur}/인</span>
                                        <span className="font-medium tabular-nums">{CURRENCY_SYMBOL[cur] || cur} {Math.round(amt / (selectedTrip.family_count || 1)).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Accordion>

            {/* ④ 카테고리별 지출 (접기) */}
            {expensesByCategory.length > 0 && (
                <Accordion title="📊 카테고리별 지출" open={openSections.cat_chart} onToggle={() => toggle("cat_chart")}>
                    <div className="space-y-1.5">
                        {expensesByCategory.map(([cat, amt]) => {
                            const pct = totalSpentKRW > 0 ? Math.round((amt / totalSpentKRW) * 100) : 0;
                            return (
                                <div key={cat} className="flex items-center gap-2">
                                    <Badge className={`text-[10px] px-1.5 py-0 shrink-0 w-12 justify-center ${CAT_COLORS[cat]}`}>{CAT_LABELS[cat] || cat}</Badge>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </Accordion>
            )}

            {/* ⑤ 일정 전체 (접기) */}
            <Accordion
                title="📅 일정 전체"
                count={`${completedSchedules}/${schedules.length} 완료 · ${schedComplPct}%`}
                open={openSections.schedules}
                onToggle={() => toggle("schedules")}
            >
                {schedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground">일정이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(schedulesByDay)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([day, items]) => (
                                <div key={day}>
                                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">Day {day}</p>
                                    <div className="space-y-1 pl-1">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-start gap-1.5 text-xs">
                                                {item.is_completed
                                                    ? <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                    : <Circle className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />}
                                                <span className="text-muted-foreground w-10 shrink-0 tabular-nums">{item.start_time?.slice(0, 5) || "--:--"}</span>
                                                <span className="mr-1">{TYPE_EMOJI[item.type] || "📌"}</span>
                                                <span className={`flex-1 ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>{item.title}</span>
                                                {item.city && <span className="text-muted-foreground shrink-0">[{item.city}]</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </Accordion>

            {/* ⑥ 지출 상세 (접기) */}
            <Accordion
                title="💳 지출 상세"
                count={`${expenses.length}건`}
                open={openSections.expenses_detail}
                onToggle={() => toggle("expenses_detail")}
            >
                {expenses.length === 0 ? (
                    <p className="text-xs text-muted-foreground">지출 내역이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {expensesByDate.map(([date, items]) => (
                            <div key={date}>
                                <p className="text-[11px] font-semibold text-muted-foreground mb-1">{date}</p>
                                <div className="space-y-1 pl-1">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center gap-1.5 text-xs">
                                            <Badge className={`text-[9px] px-1 py-0 shrink-0 ${CAT_COLORS[item.category]}`}>{CAT_LABELS[item.category] || item.category}</Badge>
                                            <span className="flex-1 truncate">{item.title}</span>
                                            <span className="font-semibold tabular-nums shrink-0">{CURRENCY_SYMBOL[item.currency] || item.currency}{item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {/* 날짜 소계 */}
                                    <div className="flex justify-end text-[11px] text-muted-foreground pt-0.5 border-t mt-1">
                                        {Object.entries(
                                            items.reduce((acc: Record<string, number>, e: any) => {
                                                const c = e.currency || "AUD";
                                                acc[c] = (acc[c] || 0) + e.amount;
                                                return acc;
                                            }, {})
                                        ).map(([c, a]) => (
                                            <span key={c} className="ml-2">{CURRENCY_SYMBOL[c] || c}{(a as number).toLocaleString()}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Accordion>

            {/* ⑦ 일기 (접기) */}
            <Accordion
                title="📖 여행 일기"
                count={`${diaries.length}편`}
                open={openSections.diaries}
                onToggle={() => toggle("diaries")}
            >
                {diaries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">작성된 일기가 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {diaries.map(d => (
                            <div key={d.id} className="border rounded-lg px-2.5 py-2 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">{d.title || "(제목 없음)"}</p>
                                    <p className="text-[11px] text-muted-foreground tabular-nums shrink-0 ml-2">{d.date ? formatLocalDateYYYYMMDD(parseStoredDateToLocal(d.date)) : ""}</p>
                                </div>
                                {d.content && (
                                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{d.content}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Accordion>

            {/* 공유 버튼 */}
            <Button onClick={handleShare} disabled={sharing} className="w-full gap-2">
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                리포트 공유하기
            </Button>
        </div>
    );
}

function MiniStat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
    return (
        <div className="bg-muted/40 border rounded-lg px-1.5 py-2 text-center">
            <p className="text-base leading-none mb-0.5">{icon}</p>
            <p className="text-[9px] text-muted-foreground leading-none">{label}</p>
            <p className="text-sm font-bold leading-tight mt-0.5">{value}</p>
            {sub && <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{sub}</p>}
        </div>
    );
}

function Accordion({
    title, count, open, onToggle, children,
}: {
    title: string; count?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
    return (
        <div className="bg-card border rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
            >
                <span className="text-sm font-semibold">{title}</span>
                <div className="flex items-center gap-1.5">
                    {count && <span className="text-[11px] text-muted-foreground">{count}</span>}
                    {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>
            {open && (
                <div className="px-3 pb-3 pt-0 border-t">
                    <div className="pt-2">{children}</div>
                </div>
            )}
        </div>
    );
}

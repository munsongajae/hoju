"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseList";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
    convertAmountToKRW,
    fetchMultipleRates,
    getUniqueExpenseCurrencies,
} from "@/lib/exchangeRate";

interface ExpenseAnalysisProps {
    expenses: ExpenseData[];
}

export function ExpenseAnalysis({ expenses }: ExpenseAnalysisProps) {
    const { t } = useTranslation();
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    const uniqueCurrencies = getUniqueExpenseCurrencies(expenses);

    useEffect(() => {
        if (uniqueCurrencies.length === 0) {
            setExchangeRates({});
            return;
        }
        let cancelled = false;
        fetchMultipleRates(uniqueCurrencies)
            .then((result) => {
                if (!cancelled) setExchangeRates(result);
            })
            .catch((err) => console.error("Failed to fetch rates:", err));
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(uniqueCurrencies)]);

    if (expenses.length === 0) {
        return null;
    }

    // 최근 7일 일별 합계 (KRW 기준). 환산 불가 통화는 합계에서 제외하고 missing으로 안내.
    const now = new Date();
    const days: { label: string; key: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        days.push({ key: format(d, "yyyy-MM-dd"), label: format(d, "M/d"), total: 0 });
    }
    const dayMap = new Map<string, number>(days.map((d) => [d.key, 0]));

    const missing = new Set<string>();
    expenses.forEach((e) => {
        const key = format(e.date, "yyyy-MM-dd");
        if (!dayMap.has(key)) return;
        const cur = (e.currency || "AUD").toUpperCase();
        const krw = convertAmountToKRW(e.amount, cur, exchangeRates);
        if (krw == null) {
            missing.add(cur);
            return;
        }
        dayMap.set(key, (dayMap.get(key) || 0) + krw);
    });

    const withTotals = days.map((d) => ({ ...d, total: dayMap.get(d.key) || 0 }));
    const maxTotal = withTotals.reduce((max, d) => (d.total > max ? d.total : max), 0);

    if (maxTotal === 0 && missing.size === 0) {
        return null;
    }

    const formatCompactKRW = (krw: number): string => {
        if (krw >= 1_000_000) return `₩${(krw / 1_000_000).toFixed(1)}M`;
        if (krw >= 1_000) return `₩${Math.round(krw / 1_000)}K`;
        return `₩${Math.round(krw).toLocaleString()}`;
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("expenses.analysis.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="h-40 flex gap-2">
                    {withTotals.map((d) => {
                        const ratio = maxTotal > 0 ? d.total / maxTotal : 0;
                        const height = Math.max(8, ratio * 100);
                        return (
                            <div key={d.key} className="flex-1 flex flex-col items-center gap-1 text-[11px]">
                                <span className="text-[10px] text-muted-foreground">{d.label}</span>
                                <div className="flex-1 flex items-end w-full">
                                    <div
                                        className="w-full mx-auto rounded-md bg-primary/70"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {d.total > 0 ? formatCompactKRW(d.total) : "-"}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {missing.size > 0 && (
                    <p className="text-[10px] text-orange-600 dark:text-orange-400">
                        {t("expenses.analysis.rateMissing", {
                            currencies: Array.from(missing).join(", "),
                        })}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

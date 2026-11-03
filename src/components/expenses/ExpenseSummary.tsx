"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { ExpenseData, ExpenseCategory } from "./ExpenseList";
import {
    convertAmountToKRW,
    fetchMultipleRates,
    sumExpensesInKRW,
} from "@/lib/exchangeRate";
import { useTranslation } from "react-i18next";

interface ExpenseSummaryProps {
    expenses: ExpenseData[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
    const { t } = useTranslation();
    const CAT_LABELS: Record<string, string> = {
        food: t("expenses.category.food"),
        transport: t("expenses.category.transport"),
        lodging: t("expenses.category.lodging"),
        activity: t("expenses.category.activity"),
        shopping: t("expenses.category.shopping"),
        etc: t("expenses.category.etc"),
    };
    const totalsByCurrency = expenses.reduce((acc, item) => {
        const cur = item.currency || 'AUD';
        acc[cur] = (acc[cur] || 0) + item.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalKRW = totalsByCurrency['KRW'] || 0;

    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [loadingRate, setLoadingRate] = useState(true);

    const localCurrencies = Object.entries(totalsByCurrency).filter(([cur]) => cur !== 'KRW');
    const currenciesToFetch = localCurrencies.map(([cur]) => cur);

    useEffect(() => {
        if (currenciesToFetch.length > 0) {
            setLoadingRate(true);
            fetchMultipleRates(currenciesToFetch)
                .then(result => {
                    setExchangeRates(result);
                })
                .catch(err => console.error("Failed to fetch rates:", err))
                .finally(() => setLoadingRate(false));
        } else {
            setLoadingRate(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(currenciesToFetch)]);

    // 환산 가능한 항목만 합산. 환율 없는 통화는 합계에서 제외하고 missingCurrencies로 노출.
    const totalSum = sumExpensesInKRW(expenses, exchangeRates);
    const totalEquivalentKRW = totalSum.totalKrw;
    const missingCurrencies = totalSum.missingCurrencies;

    const byCategory = expenses.reduce((acc, item) => {
        const cur = (item.currency || 'AUD').toUpperCase();
        const krw = convertAmountToKRW(item.amount, cur, exchangeRates);
        if (krw == null) return acc; // 환율 미수신 시 합계에서 제외
        acc[item.category] = (acc[item.category] || 0) + krw;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categories = Object.keys(byCategory) as ExpenseCategory[];
    const sortedCategories = categories.sort((a, b) => byCategory[b] - byCategory[a]);

    return (
        <Card className="mb-3 py-0 gap-0 shadow-sm">
            <CardHeader className="space-y-2 px-3 pt-3 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
                        {t("expenses.summary.title")}
                    </CardTitle>
                    {loadingRate ? (
                        <RefreshCw className="w-3 h-3 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="text-[10px] text-muted-foreground text-right leading-tight max-w-[55%] sm:max-w-[65%]">
                            {Object.entries(exchangeRates).length > 0 ? (
                                <span className="line-clamp-2 sm:line-clamp-none">
                                    {Object.entries(exchangeRates)
                                        .map(([cur, rate]) => `1 ${cur} ≈ ${Math.round(rate)}`)
                                        .join(" · ")}
                                </span>
                            ) : localCurrencies.length === 0 ? null : (
                                <span>{t("expenses.summary.defaultRate")}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-md border bg-card text-xs overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 px-2.5 py-1.5 border-b border-border/60">
                        <span className="text-muted-foreground font-medium">{t("expenses.summary.localCurrency")}</span>
                        <div className="text-right min-w-0">
                            {localCurrencies.length > 0 ? (
                                <div className="flex flex-col items-end gap-0 leading-tight">
                                    {localCurrencies.map(([cur, amt]) => (
                                        <span key={cur} className="font-medium tabular-nums">
                                            {cur === "AUD" ? "A$" : `${cur} `}
                                            {amt.toLocaleString()}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                        </div>
                        <span className="text-muted-foreground font-medium">{t("expenses.summary.krw")}</span>
                        <div className="text-right">
                            <span className="font-medium tabular-nums text-orange-600 dark:text-orange-400">
                                {totalKRW > 0 ? `₩${totalKRW.toLocaleString()}` : "-"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 px-2.5 py-1.5 bg-muted/30">
                        <span className="font-semibold text-primary text-[11px] sm:text-xs shrink-0">
                            {t("expenses.summary.totalKrw")}
                        </span>
                        <span className="font-bold text-base sm:text-lg text-primary tabular-nums truncate">
                            ≈ ₩{Math.round(totalEquivalentKRW).toLocaleString()}
                        </span>
                    </div>
                    {missingCurrencies.length > 0 && (
                        <div className="px-2.5 py-1 text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50/40 dark:bg-orange-950/20 border-t border-border/60">
                            {t("expenses.budget.rateMissing", {
                                currencies: missingCurrencies.join(", "),
                            })}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
                <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground py-1.5 rounded-md hover:bg-muted/50 -mx-1 px-1">
                            <span>{t("expenses.summary.byCategory")}</span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="space-y-2 mt-1 pt-1.5 border-t border-border/60">
                            {sortedCategories.map((cat) => {
                                // For category breakdown, we used equivalent AUD.
                                // We can display the breakdown in mixed format? No, percentage is better.
                                const amountInKRW = byCategory[cat];
                                const percentage = totalEquivalentKRW > 0 ? Math.round((amountInKRW / totalEquivalentKRW) * 100) : 0;

                                // Drill down to see raw amounts
                                const catCurrencies = expenses
                                    .filter(e => e.category === cat)
                                    .reduce((acc, item) => {
                                        const cur = item.currency || 'AUD';
                                        acc[cur] = (acc[cur] || 0) + item.amount;
                                        return acc;
                                    }, {} as Record<string, number>);

                                const catLocalCurrencies = Object.entries(catCurrencies).filter(([cur]) => cur !== 'KRW');
                                const catKRW = catCurrencies['KRW'] || 0;

                                return (
                                    <Collapsible key={cat} defaultOpen={false}>
                                        <div className="space-y-1">
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="capitalize">{CAT_LABELS[cat] || cat}</span>
                                                    <span className="text-muted-foreground flex gap-2 items-center">
                                                        <span>{percentage}%</span>
                                                        <span className="flex gap-1 items-center flex-wrap justify-end max-w-[150px]">
                                                            {catLocalCurrencies.map(([cur, amt], idx) => (
                                                                <span key={cur}>
                                                                    {idx > 0 && '+'} {cur === 'AUD' ? 'A$' : `${cur} `}{amt.toLocaleString()}
                                                                </span>
                                                            ))}
                                                            {catLocalCurrencies.length > 0 && catKRW > 0 && '+'}
                                                            {catKRW > 0 && <span>₩{catKRW.toLocaleString()}</span>}
                                                        </span>
                                                        {Object.keys(exchangeRates).length > 0 && catLocalCurrencies.length > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                (≈ ₩{Math.round(amountInKRW).toLocaleString()})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </CollapsibleTrigger>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <CollapsibleContent>
                                                <div className="pt-2 space-y-1 text-xs text-muted-foreground pl-2 border-l-2 border-primary/20">
                                                    {expenses
                                                        .filter(e => e.category === cat)
                                                        .map((expense) => {
                                                            const cur = (expense.currency || 'AUD').toUpperCase();
                                                            const isKRW = cur === 'KRW';
                                                            const expenseKRW = convertAmountToKRW(expense.amount, cur, exchangeRates);
                                                            return (
                                                                <div key={expense.id} className="flex justify-between">
                                                                    <span className="truncate flex-1 mr-2">{expense.title}</span>
                                                                    <span className="flex gap-1 shrink-0 flex-wrap justify-end max-w-[120px]">
                                                                        <span>
                                                                            {cur === 'KRW' ? '₩' : cur === 'AUD' ? 'A$' : `${cur} `}{expense.amount.toLocaleString()}
                                                                        </span>
                                                                        {!isKRW && expenseKRW != null && (
                                                                            <span className="text-muted-foreground">
                                                                                (≈ ₩{Math.round(expenseKRW).toLocaleString()})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}

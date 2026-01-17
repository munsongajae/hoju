"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { ExpenseData, ExpenseCategory } from "./ExpenseList";

interface ExpenseSummaryProps {
    expenses: ExpenseData[];
}

const CAT_LABELS: Record<string, string> = {
    food: "식비",
    transport: "교통",
    lodging: "숙박",
    activity: "관광/활동",
    shopping: "쇼핑",
    etc: "기타",
};

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
    const totalAUD = expenses
        .filter(e => !e.currency || e.currency === 'AUD')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalKRW = expenses
        .filter(e => e.currency === 'KRW')
        .reduce((sum, item) => sum + item.amount, 0);

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loadingRate, setLoadingRate] = useState(true);

    useEffect(() => {
        fetch('/api/exchange-rate')
            .then(res => res.json())
            .then(data => {
                if (data.rate) setExchangeRate(data.rate);
            })
            .catch(err => console.error("Failed to fetch rate:", err))
            .finally(() => setLoadingRate(false));
    }, []);

    // Total converted to AUD for graph/percentage purposes? 
    // Or keep them separate? User asked for Method A (Separate).
    // But percentages for category breakdown need a common base.
    // I will convert KRW to AUD for category calculation purposes if rate exists.
    // Fallback: use 900 won = 1 AUD? Or just ignore for now?
    // Let's use rate or default 900.
    const safeRate = exchangeRate || 900;


    // Calculate total roughly in KRW for expected total display
    const totalEquivalentKRW = totalKRW + (totalAUD * safeRate);
    const totalEquivalentAUD = totalAUD + (totalKRW / safeRate);

    const byCategory = expenses.reduce((acc, item) => {
        let amountInAUD = item.amount;
        if (item.currency === 'KRW') {
            amountInAUD = item.amount / safeRate;
        }
        acc[item.category] = (acc[item.category] || 0) + amountInAUD;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categories = Object.keys(byCategory) as ExpenseCategory[];
    const sortedCategories = categories.sort((a, b) => byCategory[b] - byCategory[a]);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 지출</CardTitle>
                        <div className="flex flex-col mt-1 gap-1">
                            <span className="text-2xl font-bold">A$ {totalAUD.toLocaleString()}</span>
                            {totalKRW > 0 && (
                                <span className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                                    + ₩ {totalKRW.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                    {totalKRW > 0 && (
                        <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-1">
                                <span>예상 합계 (KRW)</span>
                                {loadingRate ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                            </div>
                            <div className="text-lg font-bold mt-1 text-muted-foreground">
                                ≈ ₩ {Math.round(totalEquivalentKRW).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {exchangeRate ? `환율: 1 AUD = ${exchangeRate} KRW` : '기준: 1 AUD = 900 KRW'}
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between text-sm font-semibold py-2">
                            <span>항목별 지출</span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="space-y-3 mt-2 pt-2 border-t">
                            {sortedCategories.map((cat) => {
                                // For category breakdown, we used equivalent AUD.
                                // We can display the breakdown in mixed format? No, percentage is better.
                                const amountInAUD = byCategory[cat];
                                const percentage = totalEquivalentAUD > 0 ? Math.round((amountInAUD / totalEquivalentAUD) * 100) : 0;

                                // Drill down to see raw amounts
                                const catAUD = expenses.filter(e => e.category === cat && (!e.currency || e.currency === 'AUD')).reduce((s, i) => s + i.amount, 0);
                                const catKRW = expenses.filter(e => e.category === cat && e.currency === 'KRW').reduce((s, i) => s + i.amount, 0);
                                const catEquivalentKRW = catKRW + (catAUD * safeRate);

                                return (
                                    <Collapsible key={cat} defaultOpen={false}>
                                        <div className="space-y-1">
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="capitalize">{CAT_LABELS[cat] || cat}</span>
                                                    <span className="text-muted-foreground flex gap-2 items-center">
                                                        <span>{percentage}%</span>
                                                        <span>
                                                            {catAUD > 0 && `A$${catAUD.toLocaleString()}`}
                                                            {catAUD > 0 && catKRW > 0 && ' + '}
                                                            {catKRW > 0 && `₩${catKRW.toLocaleString()}`}
                                                        </span>
                                                        {exchangeRate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                (≈ ₩{Math.round(catEquivalentKRW).toLocaleString()})
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
                                                            const isKRW = expense.currency === 'KRW';
                                                            const expenseKRW = isKRW ? expense.amount : expense.amount * safeRate;
                                                            return (
                                                                <div key={expense.id} className="flex justify-between">
                                                                    <span className="truncate flex-1 mr-2">{expense.title}</span>
                                                                    <span className="flex gap-1 shrink-0">
                                                                        <span>
                                                                            {isKRW ? '₩' : 'A$'}{expense.amount.toLocaleString()}
                                                                        </span>
                                                                        {!isKRW && exchangeRate && (
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

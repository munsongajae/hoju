"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
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

    const krwTotal = exchangeRate ? total * exchangeRate : null;

    const byCategory = expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categories = Object.keys(byCategory) as ExpenseCategory[];
    const sortedCategories = categories.sort((a, b) => byCategory[b] - byCategory[a]);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 지출 (AUD)</CardTitle>
                        <div className="text-3xl font-bold mt-1">${total.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-1">
                            <span>예상 원화 (KRW)</span>
                            {loadingRate ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                        </div>
                        <div className="text-xl font-bold mt-1 text-muted-foreground">
                            {krwTotal ? (
                                `₩${Math.round(krwTotal).toLocaleString()}`
                            ) : (
                                exchangeRate === null && !loadingRate ? "환율 정보 없음" : "계산 중..."
                            )}
                        </div>
                        {exchangeRate && (
                            <div className="text-xs text-muted-foreground mt-1">
                                적용 환율: {exchangeRate.toLocaleString()}원 (Yahoo Finance)
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-2">
                    {sortedCategories.map((cat) => {
                        const amount = byCategory[cat];
                        const percentage = Math.round((amount / total) * 100) || 0;
                        const krwAmount = exchangeRate ? Math.round(amount * exchangeRate) : null;

                        return (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="capitalize">{CAT_LABELS[cat] || cat}</span>
                                    <span className="text-muted-foreground">
                                        {percentage}% (${amount.toLocaleString()})
                                        {krwAmount && ` · ₩${krwAmount.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect } from "react";
import { ExpenseData, ExpenseCategory } from "./ExpenseList";
import { format, startOfWeek, endOfWeek, isSameWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GroupedExpenseListProps {
    expenses: ExpenseData[];
    viewMode: "daily" | "weekly";
    onItemClick?: (expense: ExpenseData) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    lodging: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    activity: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shopping: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    etc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const categoryLabels: Record<ExpenseCategory, string> = {
    food: "식비",
    transport: "교통",
    lodging: "숙박",
    activity: "관광",
    shopping: "쇼핑",
    etc: "기타",
};

export function GroupedExpenseList({ expenses, viewMode, onItemClick }: GroupedExpenseListProps) {
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [showKRWConversion, setShowKRWConversion] = useState(true); // 원화 환산액 표시 여부

    // 환율 가져오기
    useEffect(() => {
        fetch('/api/exchange-rate')
            .then(res => res.json())
            .then(data => {
                if (data.rate) setExchangeRate(data.rate);
            })
            .catch(err => console.error("Failed to fetch rate:", err));
    }, []);

    const safeRate = exchangeRate || 900; // 기본값 900

    // Group expenses by day or week
    const grouped = expenses.reduce((acc, expense) => {
        let key: string;
        if (viewMode === "daily") {
            key = format(expense.date, "yyyy-MM-dd");
        } else {
            const weekStart = startOfWeek(expense.date, { weekStartsOn: 1 });
            key = format(weekStart, "yyyy-MM-dd");
        }

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(expense);
        return acc;
    }, {} as Record<string, ExpenseData[]>);

    // Sort keys (dates) in descending order
    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                지출 내역이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 원화 환산액 표시 토글 */}
            <div className="flex items-center justify-end gap-2 pb-2">
                <Label htmlFor="krw-conversion-toggle" className="text-sm text-muted-foreground cursor-pointer">
                    원화 환산액 표시
                </Label>
                <Switch
                    id="krw-conversion-toggle"
                    checked={showKRWConversion}
                    onCheckedChange={setShowKRWConversion}
                />
            </div>
            {sortedKeys.map((key) => {
                const items = grouped[key];
                const totalAUD = items
                    .filter(e => !e.currency || e.currency === 'AUD')
                    .reduce((sum, item) => sum + item.amount, 0);
                const totalKRW = items
                    .filter(e => e.currency === 'KRW')
                    .reduce((sum, item) => sum + item.amount, 0);

                const keyDate = new Date(key);

                let headerText: string;
                if (viewMode === "daily") {
                    headerText = format(keyDate, "M월 d일 (EEE)", { locale: ko });
                } else {
                    const weekEnd = endOfWeek(keyDate, { weekStartsOn: 1 });
                    headerText = `${format(keyDate, "M/d", { locale: ko })} ~ ${format(weekEnd, "M/d", { locale: ko })}`;
                }

                return (
                    <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between sticky top-0 bg-background py-2 border-b">
                            <h3 className="font-semibold text-sm">{headerText}</h3>
                            <div className="text-right">
                                <span className="text-sm font-bold text-primary block">A$ {totalAUD.toLocaleString()}</span>
                                {totalKRW > 0 && <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 block">+ ₩ {totalKRW.toLocaleString()}</span>}
                                {showKRWConversion && totalAUD > 0 && exchangeRate && (
                                    <span className="text-xs text-muted-foreground block mt-0.5">
                                        ≈ ₩{Math.round(totalAUD * safeRate + totalKRW).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {items.map((expense) => {
                                const isKRW = expense.currency === 'KRW';
                                return (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => onItemClick?.(expense)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[expense.category]}`}>
                                                {categoryLabels[expense.category]}
                                            </span>
                                            <div>
                                                <p className="font-medium text-sm">{expense.title}</p>
                                                {viewMode === "weekly" && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(expense.date, "M/d")} · {expense.city}
                                                        {expense.scheduleTitle && (
                                                            <> · <span className="text-blue-600 dark:text-blue-400">📅 {expense.scheduleTitle}</span></>
                                                        )}
                                                    </p>
                                                )}
                                                {viewMode === "daily" && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                        <span>{expense.city}</span>
                                                        {isKRW && <span className="text-orange-600 dark:text-orange-400 font-medium">KRW</span>}
                                                        {expense.scheduleTitle && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="text-blue-600 dark:text-blue-400">📅 {expense.scheduleTitle}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-semibold text-right">
                                            <div className="flex flex-col items-end">
                                                <span>{isKRW ? '₩' : 'A$'}{expense.amount.toLocaleString()}</span>
                                                {showKRWConversion && !isKRW && exchangeRate && (
                                                    <span className="text-xs text-muted-foreground font-normal mt-0.5">
                                                        ≈ ₩{Math.round(expense.amount * safeRate).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

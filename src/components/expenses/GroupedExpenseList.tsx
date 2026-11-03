"use client";

import { useState, useEffect } from "react";
import { ExpenseData, ExpenseCategory } from "./ExpenseList";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Receipt } from "lucide-react";
import {
    convertAmountToKRW,
    fetchMultipleRates,
    getUniqueExpenseCurrencies,
    sumExpensesInKRW,
} from "@/lib/exchangeRate";
import { useTranslation } from "react-i18next";

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

export function GroupedExpenseList({ expenses, viewMode, onItemClick }: GroupedExpenseListProps) {
    const { t, i18n } = useTranslation();
    const language = i18n.resolvedLanguage ?? i18n.language ?? "ko";
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [showKRWConversion, setShowKRWConversion] = useState(true);
    const dateLocale = language.startsWith("en") ? enUS : ko;
    const categoryLabels: Record<ExpenseCategory, string> = {
        food: t("expenses.category.food"),
        transport: t("expenses.category.transport"),
        lodging: t("expenses.category.lodging"),
        activity: t("expenses.category.activity"),
        shopping: t("expenses.category.shopping"),
        etc: t("expenses.category.etc"),
    };

    const uniqueCurrencies = getUniqueExpenseCurrencies(expenses);

    useEffect(() => {
        if (uniqueCurrencies.length > 0) {
            fetchMultipleRates(uniqueCurrencies)
                .then(result => {
                    setExchangeRates(result);
                })
                .catch(err => console.error("Failed to fetch rates:", err));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(uniqueCurrencies)]);

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
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t("expenses.group.emptyTitle")}</h3>
                <p className="text-sm text-center max-w-[250px]">
                    {t("expenses.group.emptyDesc")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 원화 환산액 표시 토글 */}
            <div className="flex items-center justify-end gap-2 pb-2">
                <Label htmlFor="krw-conversion-toggle" className="text-sm text-muted-foreground cursor-pointer">
                    {t("expenses.group.showKrw")}
                </Label>
                <Switch
                    id="krw-conversion-toggle"
                    checked={showKRWConversion}
                    onCheckedChange={setShowKRWConversion}
                />
            </div>
            {sortedKeys.map((key) => {
                const items = grouped[key];
                // Calculate totals by currency
                const totalsByCurrency = items.reduce((acc, item) => {
                    const cur = item.currency || 'AUD';
                    acc[cur] = (acc[cur] || 0) + item.amount;
                    return acc;
                }, {} as Record<string, number>);

                const totalAUD = totalsByCurrency['AUD'] || 0;
                const totalKRW = totalsByCurrency['KRW'] || 0;

                const keyDate = new Date(key);

                let headerText: string;
                if (viewMode === "daily") {
                    headerText = format(keyDate, language.startsWith("en") ? "MMM d (EEE)" : "M월 d일 (EEE)", { locale: dateLocale });
                } else {
                    const weekEnd = endOfWeek(keyDate, { weekStartsOn: 1 });
                    headerText = `${format(keyDate, "M/d", { locale: dateLocale })} ~ ${format(weekEnd, "M/d", { locale: dateLocale })}`;
                }

                return (
                    <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between sticky top-0 bg-background py-2 border-b">
                            <h3 className="font-semibold text-sm">{headerText}</h3>
                            <div className="text-right flex flex-col items-end">
                                {Object.entries(totalsByCurrency).map(([cur, amount]) => {
                                    if (cur === 'AUD' || cur === 'KRW') return null;
                                    return (
                                        <span key={cur} className="text-xs font-semibold text-purple-600 dark:text-purple-400 block mb-0.5">
                                            {cur} {amount.toLocaleString()}
                                        </span>
                                    );
                                })}
                                {(totalAUD > 0 || Object.keys(totalsByCurrency).length === 0) && (
                                    <span className="text-sm font-bold text-primary block">A$ {totalAUD.toLocaleString()}</span>
                                )}
                                {totalKRW > 0 && <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 block mt-0.5">₩ {totalKRW.toLocaleString()}</span>}
                                {showKRWConversion && (() => {
                                    const sum = sumExpensesInKRW(items, exchangeRates);
                                    if (sum.convertedCount === 0) return null;
                                    return (
                                        <>
                                            <span className="text-xs text-muted-foreground block mt-0.5">
                                                ≈ ₩{Math.round(sum.totalKrw).toLocaleString()}
                                            </span>
                                            {sum.missingCurrencies.length > 0 && (
                                                <span className="text-[10px] text-orange-600 dark:text-orange-400 block">
                                                    {t("expenses.group.rateMissing", {
                                                        currencies: sum.missingCurrencies.join(", "),
                                                    })}
                                                </span>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {items.map((expense) => {
                                const cur = expense.currency || 'AUD';
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
                                                        {cur !== 'AUD' && <span className="text-orange-600 dark:text-orange-400 font-medium">{cur}</span>}
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
                                                <span>{cur === 'KRW' ? '₩' : cur === 'AUD' ? 'A$' : `${cur} `}{expense.amount.toLocaleString()}</span>
                                                {showKRWConversion && cur !== 'KRW' && (() => {
                                                    const krw = convertAmountToKRW(expense.amount, cur, exchangeRates);
                                                    if (krw == null) return null;
                                                    return (
                                                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                                                            ≈ ₩{Math.round(krw).toLocaleString()}
                                                        </span>
                                                    );
                                                })()}
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

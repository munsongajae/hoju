"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { DollarSign, Coffee, Bus, Bed, Ticket } from "lucide-react";

export type ExpenseCategory = "food" | "transport" | "lodging" | "activity" | "shopping" | "etc";


export interface ExpenseData {
    id: string;
    date: Date;
    amount: number;
    category: ExpenseCategory;
    title: string;
    city: string;
    currency?: 'AUD' | 'KRW';
    scheduleId?: string; // 연동된 일정 ID
    scheduleTitle?: string; // 연동된 일정 제목 (표시용)
}

const categoryIcons: Record<ExpenseCategory, any> = {
    food: Coffee,
    transport: Bus,
    lodging: Bed,
    activity: Ticket,
    shopping: DollarSign,
    etc: DollarSign,
};

const categoryColors: Record<ExpenseCategory, string> = {
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    lodging: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    activity: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shopping: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    etc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

interface ExpenseListProps {
    expenses: ExpenseData[];
    onItemClick?: (expense: ExpenseData) => void;
}

export function ExpenseList({ expenses, onItemClick }: ExpenseListProps) {
    // Sort by date desc
    const sortedExpenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="space-y-3">
            {sortedExpenses.map((expense) => {
                const Icon = categoryIcons[expense.category];
                const isKRW = expense.currency === 'KRW';

                return (
                    <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onItemClick?.(expense)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${categoryColors[expense.category]}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{expense.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{format(expense.date, "MM/dd")}</span>
                                    <span>·</span>
                                    <span>{expense.city}</span>
                                    {isKRW && <span className="text-orange-600 dark:text-orange-400 font-medium ml-1">KRW</span>}
                                    {expense.scheduleTitle && (
                                        <>
                                            <span>·</span>
                                            <span className="text-blue-600 dark:text-blue-400">📅 {expense.scheduleTitle}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="font-semibold text-right">
                            {isKRW ? '₩' : 'A$'}{expense.amount.toLocaleString()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

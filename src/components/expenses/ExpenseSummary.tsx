"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Need to install if not present, but I think I didn't install progress from shadcn yet? I'll assume standard div for now to be safe or install it. 
// Actually I didn't install 'progress' in the initial shadcn setup. I'll use simple divs for bars.

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

    const byCategory = expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categories = Object.keys(byCategory) as ExpenseCategory[];
    const sortedCategories = categories.sort((a, b) => byCategory[b] - byCategory[a]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">총 지출</CardTitle>
                <div className="text-3xl font-bold">${total.toLocaleString()}</div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-2">
                    {sortedCategories.map((cat) => {
                        const amount = byCategory[cat];
                        const percentage = Math.round((amount / total) * 100) || 0;

                        return (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="capitalize">{CAT_LABELS[cat] || cat}</span>
                                    <span className="text-muted-foreground">{percentage}% (${amount.toLocaleString()})</span>
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

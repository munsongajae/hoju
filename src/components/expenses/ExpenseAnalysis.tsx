"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseList";
import { format } from "date-fns";

interface ExpenseAnalysisProps {
  expenses: ExpenseData[];
}

export function ExpenseAnalysis({ expenses }: ExpenseAnalysisProps) {
  if (expenses.length === 0) {
    return null;
  }

  // 최근 7일 기준 일별 합계 (AUD 기준, KRW는 단순 환율로 환산)
  const now = new Date();
  const days: { label: string; key: string; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = format(d, "yyyy-MM-dd");
    const label = format(d, "M/d");
    days.push({ key, label, total: 0 });
  }

  const dayMap = new Map<string, number>();
  days.forEach((d) => dayMap.set(d.key, 0));

  const DEFAULT_RATE = 900; // KRW → AUD 대략 환산용

  expenses.forEach((e) => {
    const key = format(e.date, "yyyy-MM-dd");
    if (!dayMap.has(key)) return;

    let amountAUD = e.amount;
    if (e.currency === "KRW") {
      amountAUD = e.amount / DEFAULT_RATE;
    }

    dayMap.set(key, (dayMap.get(key) || 0) + amountAUD);
  });

  const withTotals = days.map((d) => ({
    ...d,
    total: dayMap.get(d.key) || 0,
  }));

  const maxTotal = withTotals.reduce((max, d) => (d.total > max ? d.total : max), 0);

  if (maxTotal === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">최근 7일 지출 추이 (AUD 기준)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex gap-2">
          {withTotals.map((d) => {
            const ratio = d.total / maxTotal;
            const height = Math.max(8, ratio * 100); // 최소 높이 8%
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
                  {d.total > 0 ? `A$ ${d.total.toFixed(0)}` : "-"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}







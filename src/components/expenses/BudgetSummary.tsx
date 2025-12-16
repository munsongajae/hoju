"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { ExpenseData } from "./ExpenseList";

interface BudgetSummaryProps {
  expenses: ExpenseData[];
}

// 현재 스키마에서 기본 Trip ID (seed 데이터)
const DEFAULT_TRIP_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

export function BudgetSummary({ expenses }: BudgetSummaryProps) {
  const [totalBudgetAUD, setTotalBudgetAUD] = useState<string>("");
  const [totalBudgetKRW, setTotalBudgetKRW] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 실제 지출 합계
  const totalSpentAUD = expenses
    .filter((e) => !e.currency || e.currency === "AUD")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpentKRW = expenses
    .filter((e) => e.currency === "KRW")
    .reduce((sum, item) => sum + item.amount, 0);

  const ratioAUD =
    totalBudgetAUD && Number(totalBudgetAUD) > 0
      ? totalSpentAUD / Number(totalBudgetAUD)
      : 0;
  const ratioKRW =
    totalBudgetKRW && Number(totalBudgetKRW) > 0
      ? totalSpentKRW / Number(totalBudgetKRW)
      : 0;

  useEffect(() => {
    const fetchBudget = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("trip_budgets")
          .select("total_budget_aud, total_budget_krw")
          .eq("trip_id", DEFAULT_TRIP_ID)
          .maybeSingle();

        if (error) {
          console.error("Failed to fetch budget:", error);
          return;
        }

        if (data) {
          if (data.total_budget_aud != null) {
            setTotalBudgetAUD(String(Number(data.total_budget_aud)));
          }
          if (data.total_budget_krw != null) {
            setTotalBudgetKRW(String(Number(data.total_budget_krw)));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const totalAUDNumber = totalBudgetAUD ? Number(totalBudgetAUD) : null;
      const totalKRWNumber = totalBudgetKRW ? Number(totalBudgetKRW) : null;

      const { error } = await supabase
        .from("trip_budgets")
        .upsert(
          {
            trip_id: DEFAULT_TRIP_ID,
            total_budget_aud: totalAUDNumber,
            total_budget_krw: totalKRWNumber,
          },
          { onConflict: "trip_id" }
        );

      if (error) {
        console.error("Failed to save budget:", error);
        alert("예산 저장에 실패했습니다.");
        return;
      }

      alert("예산이 저장되었습니다.");
    } finally {
      setSaving(false);
    }
  };

  const renderBar = (ratio: number) => {
    const clamped = Math.min(ratio, 1);
    return (
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={
            "h-full rounded-full " +
            (ratio > 1
              ? "bg-red-500"
              : ratio > 0.8
              ? "bg-orange-500"
              : "bg-emerald-500")
          }
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">예산 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">전체 예산 (AUD)</Label>
              <Input
                type="number"
                min={0}
                value={totalBudgetAUD}
                onChange={(e) => setTotalBudgetAUD(e.target.value)}
                placeholder="예: 5000"
              />
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>사용액: A$ {totalSpentAUD.toLocaleString()}</span>
                {totalBudgetAUD && Number(totalBudgetAUD) > 0 && (
                  <span>{Math.round(ratioAUD * 100)}%</span>
                )}
              </div>
              {totalBudgetAUD && Number(totalBudgetAUD) > 0 && renderBar(ratioAUD)}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">전체 예산 (KRW)</Label>
              <Input
                type="number"
                min={0}
                value={totalBudgetKRW}
                onChange={(e) => setTotalBudgetKRW(e.target.value)}
                placeholder="예: 3,000,000"
              />
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>사용액: ₩ {totalSpentKRW.toLocaleString()}</span>
                {totalBudgetKRW && Number(totalBudgetKRW) > 0 && (
                  <span>{Math.round(ratioKRW * 100)}%</span>
                )}
              </div>
              {totalBudgetKRW && Number(totalBudgetKRW) > 0 && renderBar(ratioKRW)}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving || loading}>
              {saving ? "저장 중..." : "예산 저장"}
            </Button>
          </div>
        </form>

        {(ratioAUD > 1 || ratioKRW > 1) && (
          <div className="text-xs text-red-600 dark:text-red-400">
            예산을 초과했습니다. 지출을 다시 점검해 보세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

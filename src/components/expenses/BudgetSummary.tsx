"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { ExpenseData } from "./ExpenseList";
import { useTrip } from "@/contexts/TripContext";

interface BudgetSummaryProps {
  expenses: ExpenseData[];
}

export function BudgetSummary({ expenses }: BudgetSummaryProps) {
  const { selectedTripId } = useTrip();
  const [totalBudgetKRW, setTotalBudgetKRW] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  // 환율 가져오기
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) setExchangeRate(data.rate);
      })
      .catch(err => console.error("Failed to fetch rate:", err))
      .finally(() => setLoadingRate(false));
  }, []);

  // 실제 지출 합계 (모든 통화를 원화로 합산)
  const safeRate = exchangeRate || 900; // 기본값 900
  
  const totalSpentKRWDirect = expenses
    .filter((e) => e.currency === "KRW")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpentAUD = expenses
    .filter((e) => !e.currency || e.currency === "AUD")
    .reduce((sum, item) => sum + item.amount, 0);

  // AUD 지출을 원화로 환산하여 합산
  const totalSpentKRW = totalSpentKRWDirect + (totalSpentAUD * safeRate);

  const ratioKRW =
    totalBudgetKRW && Number(totalBudgetKRW) > 0
      ? totalSpentKRW / Number(totalBudgetKRW)
      : 0;

  useEffect(() => {
    if (!selectedTripId) return;

    const fetchBudget = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("trip_budgets")
          .select("total_budget_krw")
          .eq("trip_id", selectedTripId)
          .maybeSingle();

        if (error) {
          console.error("Failed to fetch budget:", error);
          return;
        }

        if (data && data.total_budget_krw != null) {
          setTotalBudgetKRW(String(Number(data.total_budget_krw)));
        } else {
          setTotalBudgetKRW("");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [selectedTripId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert("여행을 선택해주세요.");
      return;
    }

    setSaving(true);
    try {
      const totalKRWNumber = totalBudgetKRW ? Number(totalBudgetKRW) : null;

      const { error } = await supabase
        .from("trip_budgets")
        .upsert(
          {
            trip_id: selectedTripId,
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
              <span>
                사용액: ₩ {Math.round(totalSpentKRW).toLocaleString()}
                {totalSpentAUD > 0 && (
                  <span className="ml-1 text-[10px]">
                    (A$ {totalSpentAUD.toLocaleString()} 포함)
                  </span>
                )}
              </span>
              {totalBudgetKRW && Number(totalBudgetKRW) > 0 && (
                <span>{Math.round(ratioKRW * 100)}%</span>
              )}
            </div>
            {loadingRate && (
              <div className="text-[10px] text-muted-foreground">
                환율 로딩 중...
              </div>
            )}
            {!loadingRate && exchangeRate && (
              <div className="text-[10px] text-muted-foreground">
                환율: 1 AUD = {exchangeRate} KRW
              </div>
            )}
            {totalBudgetKRW && Number(totalBudgetKRW) > 0 && renderBar(ratioKRW)}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving || loading}>
              {saving ? "저장 중..." : "예산 저장"}
            </Button>
          </div>
        </form>

        {ratioKRW > 1 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            예산을 초과했습니다. 지출을 다시 점검해 보세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}



"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, generateId } from "@/lib/db";
import { ExpenseData } from "./ExpenseList";
import { useTrip } from "@/contexts/TripContext";
import {
    fetchMultipleRates,
    getUniqueExpenseCurrencies,
    sumExpensesInKRW,
} from "@/lib/exchangeRate";
import { useTranslation } from "react-i18next";

interface BudgetSummaryProps {
  expenses: ExpenseData[];
}

export function BudgetSummary({ expenses }: BudgetSummaryProps) {
  const { t } = useTranslation();
  const { selectedTripId } = useTrip();
  const [totalBudgetKRW, setTotalBudgetKRW] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRate, setLoadingRate] = useState(true);

  const uniqueCurrencies = getUniqueExpenseCurrencies(expenses);

  // 지출에 사용된 모든 비-KRW 통화의 환율을 가져옵니다.
  useEffect(() => {
    if (uniqueCurrencies.length === 0) {
      setExchangeRates({});
      setLoadingRate(false);
      return;
    }
    setLoadingRate(true);
    let cancelled = false;
    fetchMultipleRates(uniqueCurrencies)
      .then(result => {
        if (!cancelled) setExchangeRates(result);
      })
      .catch(err => console.error("Failed to fetch rates:", err))
      .finally(() => {
        if (!cancelled) setLoadingRate(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(uniqueCurrencies)]);

  // 환산 가능한 항목만 합산. 환율 없는 통화는 missingCurrencies로 별도 안내.
  const sum = sumExpensesInKRW(expenses, exchangeRates);
  const totalSpentKRW = sum.totalKrw;
  const missingCurrencies = sum.missingCurrencies;
  const appliedRateCount = Object.keys(exchangeRates).length;

  const ratioKRW =
    totalBudgetKRW && Number(totalBudgetKRW) > 0
      ? totalSpentKRW / Number(totalBudgetKRW)
      : 0;

  useEffect(() => {
    if (!selectedTripId) return;

    const fetchBudget = async () => {
      setLoading(true);
      try {
        const data = await db.trip_budgets
          .where("trip_id")
          .equals(selectedTripId)
          .first();

        if (data && data.total_budget_krw != null) {
          setTotalBudgetKRW(String(Number(data.total_budget_krw)));
        } else {
          setTotalBudgetKRW("");
        }
      } catch (error) {
        console.error("Failed to fetch budget:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [selectedTripId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert(t("expenses.budget.selectTrip"));
      return;
    }

    setSaving(true);
    try {
      const totalKRWNumber = totalBudgetKRW ? Number(totalBudgetKRW) : undefined;

      const existing = await db.trip_budgets
          .where("trip_id")
          .equals(selectedTripId)
          .first();

      if (existing) {
          await db.trip_budgets.update(existing.id, {
              total_budget_krw: totalKRWNumber,
          });
      } else {
          await db.trip_budgets.add({
              id: generateId(),
              trip_id: selectedTripId,
              total_budget_krw: totalKRWNumber,
              created_at: new Date().toISOString()
          });
      }

      alert(t("expenses.budget.saveSuccess"));
    } catch (error) {
      console.error("Failed to save budget:", error);
      alert(t("expenses.budget.saveFail"));
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
        <CardTitle className="text-base">{t("expenses.budget.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("expenses.budget.totalBudget")}</Label>
            <Input
              type="number"
              min={0}
              value={totalBudgetKRW}
              onChange={(e) => setTotalBudgetKRW(e.target.value)}
              placeholder={t("expenses.budget.placeholder")}
            />
            <div className="text-[11px] text-muted-foreground flex justify-between">
              <span>
                {t("expenses.budget.spent")}: ₩ {Math.round(totalSpentKRW).toLocaleString()}
              </span>
              {totalBudgetKRW && Number(totalBudgetKRW) > 0 && (
                <span>{Math.round(ratioKRW * 100)}%</span>
              )}
            </div>
            {loadingRate && (
              <div className="text-[10px] text-muted-foreground">
                {t("expenses.budget.rateLoading")}
              </div>
            )}
            {!loadingRate && appliedRateCount > 0 && (
              <div className="text-[10px] text-muted-foreground">
                {t("expenses.budget.rateApplied", { count: appliedRateCount })}
              </div>
            )}
            {!loadingRate && missingCurrencies.length > 0 && (
              <div className="text-[10px] text-orange-600 dark:text-orange-400">
                {t("expenses.budget.rateMissing", { currencies: missingCurrencies.join(", ") })}
              </div>
            )}
            {totalBudgetKRW && Number(totalBudgetKRW) > 0 && renderBar(ratioKRW)}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving || loading}>
              {saving ? t("expenses.budget.saving") : t("expenses.budget.save")}
            </Button>
          </div>
        </form>

        {ratioKRW > 1 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {t("expenses.budget.overBudget")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}







"use client";

import { useState, useEffect, useMemo } from "react";
import { ExpenseData, ExpenseCategory } from "@/components/expenses/ExpenseList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { GroupedExpenseList } from "@/components/expenses/GroupedExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { BudgetSummary } from "@/components/expenses/BudgetSummary";
import { ExpenseAnalysis } from "@/components/expenses/ExpenseAnalysis";
import { db } from "@/lib/db";
import { Loader2, Search, ArrowUpDown, Eye, EyeOff, Download } from "lucide-react";
import { useTrip } from "@/contexts/TripContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ShareButton } from "@/components/ui/share-button";
import { formatExpenseText } from "@/lib/shareUtils";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "react-i18next";
import { parseStoredDateToLocal } from "@/lib/localDate";

type ViewMode = "daily" | "weekly";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const { selectedTripId, selectedTrip } = useTrip();
  const { t } = useTranslation();

  // 섹션 토글 상태
  const [showBudget, setShowBudget] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([
    "food",
    "transport",
    "lodging",
    "activity",
    "shopping",
    "etc",
  ]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Edit Dialog State
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedTripId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    fetchExpenses();
  }, [selectedTripId]);

  async function fetchExpenses() {
    if (!selectedTripId) {
      setLoading(false);
      setExpenses([]);
      return;
    }

    try {
      setLoading(true);
      
      const expensesData = await db.expenses
        .where("trip_id")
        .equals(selectedTripId)
        .toArray();

      expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Fetch schedule for join
      const scheduleIds = expensesData.map(e => e.schedule_id).filter(Boolean) as string[];
      const schedules = await db.schedules.where("id").anyOf(scheduleIds).toArray();
      const scheduleMap = new Map(schedules.map(s => [s.id, s]));

      const formattedData: ExpenseData[] = expensesData.map((item) => {
          const schedule = item.schedule_id ? scheduleMap.get(item.schedule_id) : null;
          return {
            id: item.id,
            date: parseStoredDateToLocal(item.date),
            amount: item.amount,
            category: item.category as ExpenseCategory,
            title: item.title,
            city: item.city || t("common.city.sydney"),
            currency: (item.currency || "AUD") as "AUD" | "KRW",
            scheduleId: item.schedule_id,
            scheduleTitle: schedule?.title,
          };
      });
      setExpenses(formattedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 필터링 및 정렬된 지출 목록
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // 검색 필터
      const searchMatch =
        !searchQuery ||
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 통화 필터
      const currencyMatch =
        selectedCurrencies.length === 0 || selectedCurrencies.includes(expense.currency || "AUD");

      // 카테고리 필터
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(expense.category);

      // 금액 범위 필터
      const minMatch = !minAmount || expense.amount >= Number(minAmount);
      const maxMatch = !maxAmount || expense.amount <= Number(maxAmount);

      return searchMatch && currencyMatch && categoryMatch && minMatch && maxMatch;
    });

    // 정렬 적용
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "date":
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

    return filtered;
  }, [expenses, searchQuery, selectedCurrencies, selectedCategories, minAmount, maxAmount, sortBy]);

  const uniqueCurrencies = useMemo(() => Array.from(new Set(expenses.map(e => e.currency || "AUD"))), [expenses]);

  const categoryLabels: Record<ExpenseCategory, string> = {
    food: t("expenses.category.food"),
    transport: t("expenses.category.transport"),
    lodging: t("expenses.category.lodging"),
    activity: t("expenses.category.activity"),
    shopping: t("expenses.category.shopping"),
    etc: t("expenses.category.etc"),
  };

  const toggleCategory = (category: ExpenseCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies((prev) => {
      // 만약 배열이 비어있는 상태(전체선택)에서 하나를 누르면 그것만 선택되게 처리
      if (prev.length === 0) return [currency];
      const newList = prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency];
      // 만약 하나도 선택된게 없다면(모두 선택해제) 빈 배열(전체 선택)로 리턴
      return newList.length === 0 ? [] : newList;
    });
  };

  const handleExportCSV = async () => {
    if (filteredAndSortedExpenses.length === 0) {
      alert(t("expenses.export.empty"));
      return;
    }

    const headers = [
      t("expenses.csv.header.date"),
      t("expenses.csv.header.city"),
      t("expenses.csv.header.category"),
      t("expenses.csv.header.currency"),
      t("expenses.csv.header.amount"),
      t("expenses.csv.header.title"),
      t("expenses.csv.header.schedule"),
    ];

    const categoryLabels: Record<ExpenseCategory, string> = {
      food: t("expenses.category.food"),
      transport: t("expenses.categoryCsv.transport"),
      lodging: t("expenses.categoryCsv.lodging"),
      activity: t("expenses.categoryCsv.activity"),
      shopping: t("expenses.category.shopping"),
      etc: t("expenses.category.etc"),
    };

    const csvRows = [
      headers.join(","),
      ...filteredAndSortedExpenses.map(expense => {
        const date = format(expense.date, 'yyyy-MM-dd');
        const city = expense.city || t("common.unspecified");
        const cat = categoryLabels[expense.category] || expense.category;
        const cur = expense.currency || "AUD";
        const amt = expense.amount;
        const title = `"${expense.title.replace(/"/g, '""')}"`;
        const sched = `"${(expense.scheduleTitle || "").replace(/"/g, '""')}"`;

        return [date, city, cat, cur, amt, title, sched].join(",");
      })
    ];

    const csvString = csvRows.join("\n");
    const csvData = "\uFEFF" + csvString;
    const fileName = `${t("expenses.export.filePrefix")}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;

    try {
      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvData,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: t("expenses.export.shareTitle"),
          text: t("expenses.export.shareText"),
          url: result.uri,
          dialogTitle: t("expenses.export.shareDialog"),
        });
        return;
      }

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("CSV 내보내기 실패:", err);
      alert(t("expenses.export.fail", { message: err?.message || t("common.unknownError") }));
    }
  };

  return (
    <div className="pb-24 p-4 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
            <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
            <h1 className="text-2xl font-bold whitespace-nowrap shrink-0">{t("expenses.title")}</h1>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
            <ShareButton
                title={t("expenses.share.title", { trip: selectedTrip?.title || t("common.trip") })}
                generateText={() => formatExpenseText(
                    selectedTrip?.title || t("common.trip"),
                    filteredAndSortedExpenses,
                    searchQuery ? t("expenses.share.search", { query: searchQuery }) : undefined
                )}
            />
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExportCSV}>
                <Download className="w-3.5 h-3.5" />
                <span>{t("expenses.exportCsv")}</span>
            </Button>
            <AddExpenseDialog onExpenseAdded={fetchExpenses} />
        </div>
      </div>

      {/* 섹션 표시 토글 */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Button
          type="button"
          variant={showBudget ? "default" : "outline"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowBudget((prev) => !prev)}
        >
          {showBudget ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {t("expenses.toggle.budget")}
        </Button>
        <Button
          type="button"
          variant={showAnalysis ? "default" : "outline"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowAnalysis((prev) => !prev)}
        >
          {showAnalysis ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {t("expenses.toggle.trend")}
        </Button>
        <Button
          type="button"
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {t("expenses.toggle.filter")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* 예산 요약 */}
          {showBudget && <BudgetSummary expenses={expenses} />}

          {/* 지출 요약 및 분석 차트 */}
          <ExpenseSummary expenses={expenses} />
          {showAnalysis && <ExpenseAnalysis expenses={expenses} />}

          {/* 검색 및 필터 */}
          {showFilters && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("expenses.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={sortBy} onValueChange={(value: "date" | "amount") => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t("expenses.sort.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">{t("expenses.sort.date")}</SelectItem>
                    <SelectItem value="amount">{t("expenses.sort.amount")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 통화 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("expenses.filter.currency")}</Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueCurrencies.map(currency => (
                    <Button
                      key={currency}
                      variant={selectedCurrencies.length === 0 || selectedCurrencies.includes(currency) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCurrency(currency)}
                    >
                      {currency}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("expenses.filter.category")}</Label>
                <div className="flex flex-wrap gap-2">
                  {(["food", "transport", "lodging", "activity", "shopping", "etc"] as ExpenseCategory[]).map(
                    (cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                          {categoryLabels[cat]}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 금액 범위 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("expenses.filter.amountRange")}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("expenses.filter.minAmount")}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="flex-1"
                  />
                  <span className="self-center">~</span>
                  <Input
                    type="number"
                    placeholder={t("expenses.filter.maxAmount")}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 지출 내역 + 일/주별 토글 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t("expenses.list.title")}</h2>
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-3 text-xs rounded-md", viewMode === "daily" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("daily")}
                >
                  {t("expenses.view.daily")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-3 text-xs rounded-md", viewMode === "weekly" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("weekly")}
                >
                  {t("expenses.view.weekly")}
                </Button>
              </div>
            </div>
            <GroupedExpenseList
              expenses={filteredAndSortedExpenses}
              viewMode={viewMode}
              onItemClick={(expense) => {
                setEditingExpense(expense);
                setEditDialogOpen(true);
              }}
            />
          </div>
        </>
      )}

      <EditExpenseDialog
        expense={editingExpense}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onExpenseUpdated={fetchExpenses}
      />
    </div>
  );
}

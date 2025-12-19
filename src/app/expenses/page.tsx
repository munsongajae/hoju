"use client";

import { useState, useEffect, useMemo } from "react";
import { ExpenseData, ExpenseCategory } from "@/components/expenses/ExpenseList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { GroupedExpenseList } from "@/components/expenses/GroupedExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { BudgetSummary } from "@/components/expenses/BudgetSummary";
import { ExpenseAnalysis } from "@/components/expenses/ExpenseAnalysis";
import { supabase } from "@/lib/supabase";
import { Loader2, Search, ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { useTrip } from "@/contexts/TripContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ViewMode = "daily" | "weekly";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const { selectedTripId } = useTrip();

  // 섹션 토글 상태
  const [showBudget, setShowBudget] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [selectedCurrencies, setSelectedCurrencies] = useState<("AUD" | "KRW")[]>(["AUD", "KRW"]);
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
    if (selectedTripId) {
      fetchExpenses();
    }
  }, [selectedTripId]);

  async function fetchExpenses() {
    if (!selectedTripId) {
      setLoading(false);
      setExpenses([]);
      return;
    }

    try {
      setLoading(true);
      // schedule 정보도 함께 가져오기
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          schedule:schedules(id, title)
        `)
        .eq("trip_id", selectedTripId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
      } else if (data) {
        const formattedData: ExpenseData[] = data.map((item: any) => ({
          id: item.id,
          date: new Date(item.date),
          amount: item.amount,
          category: item.category as ExpenseCategory,
          title: item.title,
          city: item.city,
          currency: item.currency,
          scheduleId: item.schedule_id,
          scheduleTitle: item.schedule?.title, // 연동된 일정 제목
        }));
        setExpenses(formattedData);
      }
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

  const categoryLabels: Record<ExpenseCategory, string> = {
    food: "식비",
    transport: "교통",
    lodging: "숙박",
    activity: "관광",
    shopping: "쇼핑",
    etc: "기타",
  };

  const toggleCategory = (category: ExpenseCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleCurrency = (currency: "AUD" | "KRW") => {
    setSelectedCurrencies((prev) =>
      prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency]
    );
  };

  return (
    <div className="pb-24 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">지출 관리</h1>
        <AddExpenseDialog onExpenseAdded={fetchExpenses} />
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
          예산
        </Button>
        <Button
          type="button"
          variant={showAnalysis ? "default" : "outline"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowAnalysis((prev) => !prev)}
        >
          {showAnalysis ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          최근 7일 추이
        </Button>
        <Button
          type="button"
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          검색/필터
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
                  placeholder="제목 또는 카테고리로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={sortBy} onValueChange={(value: "date" | "amount") => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">날짜순</SelectItem>
                    <SelectItem value="amount">금액순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 통화 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">통화</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCurrencies.includes("AUD") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCurrency("AUD")}
                  >
                    AUD
                  </Button>
                  <Button
                    variant={selectedCurrencies.includes("KRW") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCurrency("KRW")}
                  >
                    KRW
                  </Button>
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">카테고리</Label>
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
                <Label className="text-sm font-medium">금액 범위</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="최소 금액"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="flex-1"
                  />
                  <span className="self-center">~</span>
                  <Input
                    type="number"
                    placeholder="최대 금액"
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
              <h2 className="text-lg font-semibold">지출 내역</h2>
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-3 text-xs rounded-md", viewMode === "daily" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("daily")}
                >
                  일별
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-3 text-xs rounded-md", viewMode === "weekly" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("weekly")}
                >
                  주별
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

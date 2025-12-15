"use client";

import { useState, useEffect } from "react";
import { ExpenseData, ExpenseCategory } from "@/components/expenses/ExpenseList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { GroupedExpenseList } from "@/components/expenses/GroupedExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "daily" | "weekly";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("daily");

    // Edit Dialog State
    const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    async function fetchExpenses() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching expenses:', error);
            } else if (data) {
                const formattedData: ExpenseData[] = data.map((item: any) => ({
                    id: item.id,
                    date: new Date(item.date),
                    amount: item.amount,
                    category: item.category as ExpenseCategory,
                    title: item.title,
                    city: item.city,
                    currency: item.currency
                }));
                setExpenses(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="pb-24 p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">지출 관리</h1>
                <AddExpenseDialog onExpenseAdded={fetchExpenses} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <ExpenseSummary expenses={expenses} />

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">지출 내역</h2>
                            <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 px-3 text-xs rounded-md",
                                        viewMode === "daily" && "bg-background shadow-sm"
                                    )}
                                    onClick={() => setViewMode("daily")}
                                >
                                    일별
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 px-3 text-xs rounded-md",
                                        viewMode === "weekly" && "bg-background shadow-sm"
                                    )}
                                    onClick={() => setViewMode("weekly")}
                                >
                                    주별
                                </Button>
                            </div>
                        </div>
                        <GroupedExpenseList
                            expenses={expenses}
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

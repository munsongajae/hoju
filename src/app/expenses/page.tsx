"use client";

import { useState, useEffect } from "react";
import { ExpenseList, ExpenseData, ExpenseCategory } from "@/components/expenses/ExpenseList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [loading, setLoading] = useState(true);

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
                    city: item.city
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
                        <h2 className="text-lg font-semibold mb-3">지출 내역</h2>
                        <ExpenseList
                            expenses={expenses}
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

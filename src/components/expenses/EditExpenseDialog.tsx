"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExpenseData, ExpenseCategory } from "./ExpenseList";

interface EditExpenseDialogProps {
    expense: ExpenseData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExpenseUpdated: () => void;
}

export function EditExpenseDialog({
    expense,
    open,
    onOpenChange,
    onExpenseUpdated
}: EditExpenseDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [date, setDate] = useState("");
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("food");
    const [city, setCity] = useState("시드니");
    const [currency, setCurrency] = useState<'AUD' | 'KRW'>('AUD');

    useEffect(() => {
        if (expense) {
            setDate(expense.date.toISOString().split('T')[0]);
            setAmount(String(expense.amount));
            setTitle(expense.title);
            setCategory(expense.category);
            setCity(expense.city || "시드니");
            setCurrency(expense.currency || 'AUD');
        }
    }, [expense]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("expenses")
                .update({
                    date: new Date(date).toISOString(),
                    amount: parseFloat(amount),
                    title,
                    category,
                    city,
                    currency
                })
                .eq('id', expense.id);

            if (error) throw error;

            onOpenChange(false);
            onExpenseUpdated();
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("지출 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!expense) return;
        if (!confirm("정말 이 지출 내역을 삭제하시겠습니까?")) return;

        setDeleting(true);
        try {
            const { error } = await supabase
                .from("expenses")
                .delete()
                .eq('id', expense.id);

            if (error) throw error;

            onOpenChange(false);
            onExpenseUpdated();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("지출 삭제에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>지출 수정</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label htmlFor="edit-date">날짜</Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>통화</Label>
                            <div className="flex rounded-md shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setCurrency('AUD')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium border rounded-l-md focus:z-10 focus:ring-1 focus:ring-primary ${currency === 'AUD'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-foreground border-input hover:bg-muted'
                                        }`}
                                >
                                    AUD (A$)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrency('KRW')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium border-t border-b border-r rounded-r-md focus:z-10 focus:ring-1 focus:ring-primary ${currency === 'KRW'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-foreground border-input hover:bg-muted'
                                        }`}
                                >
                                    KRW (₩)
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">금액</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step={currency === 'KRW' ? "100" : "0.01"}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={currency === 'KRW' ? "0" : "0.00"}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-city">도시</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger id="edit-city">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="시드니">시드니</SelectItem>
                                <SelectItem value="멜버른">멜버른</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="grid gap-2">
                        <Label htmlFor="edit-title">내용</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-category">카테고리</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                            <SelectTrigger id="edit-category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="food">식비</SelectItem>
                                <SelectItem value="transport">교통</SelectItem>
                                <SelectItem value="lodging">숙박</SelectItem>
                                <SelectItem value="activity">관광/활동</SelectItem>
                                <SelectItem value="shopping">쇼핑</SelectItem>
                                <SelectItem value="etc">기타</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="mr-auto"
                        >
                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            삭제
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            저장하기
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}

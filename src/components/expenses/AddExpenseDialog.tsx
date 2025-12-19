"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExpenseCategory } from "./ExpenseList";
import { useTrip } from "@/contexts/TripContext";

interface AddExpenseDialogProps {
    onExpenseAdded: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialData?: {
        date?: string;
        title?: string;
        category?: ExpenseCategory;
        city?: string;
        amount?: number;
        scheduleId?: string; // 일정과 연동하기 위한 schedule_id
    };
    trigger?: React.ReactNode;
}

export function AddExpenseDialog({
    onExpenseAdded,
    open,
    onOpenChange,
    initialData,
    trigger
}: AddExpenseDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { selectedTripId, selectedTrip } = useTrip();

    const isControlled = open !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const setFinalOpen = (val: boolean) => {
        if (isControlled) {
            onOpenChange?.(val);
        } else {
            setInternalOpen(val);
        }
    };


    // Form States
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("food");
    const [city, setCity] = useState("시드니");
    const [currency, setCurrency] = useState<'AUD' | 'KRW'>('AUD');
    const [schedules, setSchedules] = useState<{ id: string; title: string; day_number: number }[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>("none");

    // Initialize with initialData when opening
    useEffect(() => {
        if (finalOpen) {
            if (initialData) {
                if (initialData.date) setDate(initialData.date);
                if (initialData.title) setTitle(initialData.title);
                if (initialData.category) setCategory(initialData.category);
                if (initialData.city) setCity(initialData.city);
                if (initialData.amount) setAmount(initialData.amount.toString());
                if (initialData.scheduleId) setSelectedScheduleId(initialData.scheduleId);
            }

            // Fetch schedules
            if (selectedTripId) {
                const fetchSchedules = async () => {
                    const { data } = await supabase
                        .from("schedules")
                        .select("id, title, day_number")
                        .eq("trip_id", selectedTripId)
                        .order("day_number", { ascending: true })
                        .order("start_time", { ascending: true });

                    if (data) {
                        setSchedules(data);
                    }
                };
                fetchSchedules();
            }
        }
    }, [finalOpen, initialData, isControlled, selectedTripId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTripId) {
            alert("여행을 선택해주세요.");
            return;
        }
        setLoading(true);

        try {
            const expenseData: any = {
                trip_id: selectedTripId,
                date: new Date(date).toISOString(),
                amount: parseFloat(amount),
                title,
                category,
                city,
                currency
            };

            // schedule_id가 있으면 추가
            if (selectedScheduleId && selectedScheduleId !== "none") {
                expenseData.schedule_id = selectedScheduleId;
            } else if (initialData?.scheduleId) {
                // initialData가 있고 사용자가 변경하지 않았을 경우 (UI초기화 로직에 따라 위 조건에 걸릴 수도 있지만 안전장치)
                expenseData.schedule_id = initialData.scheduleId;
            }

            const { error } = await supabase.from("expenses").insert([expenseData]);

            if (error) throw error;

            setTitle("");
            setAmount("");
            // Don't reset currency, potentially useful to keep last selection? Or reset to AUD.
            // setCurrency('AUD'); 
            if (!isControlled) setInternalOpen(false);
            setFinalOpen(false);
            onExpenseAdded();
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("지출 추가에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={finalOpen} onOpenChange={setFinalOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button size="icon" className="h-8 w-8 rounded-full">
                        <Plus className="w-5 h-5" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>새 지출 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label htmlFor="date">날짜</Label>
                        <Input
                            id="date"
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
                            <Label htmlFor="amount">금액</Label>
                            <Input
                                id="amount"
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
                        <Label htmlFor="city">도시</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger id="city">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="시드니">시드니</SelectItem>
                                <SelectItem value="멜버른">멜버른</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">카테고리</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                            <SelectTrigger id="category">
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

                    <div className="grid gap-2">
                        <Label htmlFor="title">내용</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 점심 식사"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="schedule">일정 연동 (선택)</Label>
                        <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                            <SelectTrigger id="schedule">
                                <SelectValue placeholder="일정을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">선택 안 함</SelectItem>
                                {schedules.map((schedule) => {
                                    let dateStr = "";
                                    if (selectedTrip?.start_date && schedule.day_number) {
                                        const date = new Date(selectedTrip.start_date);
                                        date.setDate(date.getDate() + (schedule.day_number - 1));
                                        dateStr = date.toISOString().slice(5, 10); // MM-DD
                                    }
                                    return (
                                        <SelectItem key={schedule.id} value={schedule.id}>
                                            {dateStr ? `[${dateStr}] ` : `[Day ${schedule.day_number}] `}{schedule.title}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            추가하기
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

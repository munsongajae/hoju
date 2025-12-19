"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Tag, AlignLeft, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseCategory, ExpenseData } from "@/components/expenses/ExpenseList";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ScheduleItem {
    id: string;
    time: string;
    title: string;
    type: "view" | "food" | "move" | "rest" | "shop" | "kids";
    completed?: boolean;
    memo?: string;
    place?: {
        id: string;
        name: string;
    } | null;
}

interface TodayScheduleProps {
    items: ScheduleItem[];
    dayNumber?: number;
    currentCity?: string;
}

const typeColors: Record<string, string> = {
    view: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    move: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    rest: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    kids: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const typeLabels: Record<string, string> = {
    view: "관광",
    food: "식사",
    move: "이동",
    rest: "휴식",
    shop: "쇼핑",
    kids: "키즈",
};

const mapToExpenseCategory = (type: string): ExpenseCategory => {
    switch (type) {
        case 'food': return 'food';
        case 'move': return 'transport';
        case 'shop': return 'shopping';
        case 'view':
        case 'kids': return 'activity';
        default: return 'etc';
    }
};

export function TodaySchedule({ items, dayNumber, currentCity }: TodayScheduleProps) {
    const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // 연동된 지출
    const [linkedExpenses, setLinkedExpenses] = useState<ExpenseData[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    // 상세 다이얼로그 열릴 때 지출 가져오기
    useEffect(() => {
        if (selectedItem && isDialogOpen) {
            fetchLinkedExpenses(selectedItem.id);
        } else {
            setLinkedExpenses([]);
        }
    }, [selectedItem, isDialogOpen]);

    const fetchLinkedExpenses = async (scheduleId: string) => {
        setLoadingExpenses(true);
        try {
            const { data, error } = await supabase
                .from("expenses")
                .select("*")
                .eq("schedule_id", scheduleId)
                .order("date", { ascending: false });

            if (data) {
                const formattedData: ExpenseData[] = data.map((item: any) => ({
                    id: item.id,
                    date: new Date(item.date),
                    amount: item.amount,
                    category: item.category as ExpenseCategory,
                    title: item.title,
                    city: item.city,
                    currency: item.currency,
                }));
                setLinkedExpenses(formattedData);
            }
        } catch (err) {
            console.error("Failed to fetch linked expenses:", err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    const handleItemClick = (item: ScheduleItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                    {dayNumber ? `Day ${dayNumber} 일정` : "오늘 일정"}
                </h2>
                <Badge variant="outline" className="font-normal">
                    {items.length}개 활동
                </Badge>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative flex gap-x-4 rounded-xl border bg-card p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer hover:shadow-sm"
                        onClick={() => handleItemClick(item)}
                    >
                        <div
                            className={cn(
                                "absolute -bottom-6 left-6 top-10 w-px bg-border group-last:hidden",
                            )}
                        />

                        <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full border bg-background text-xs font-bold text-muted-foreground shadow-sm">
                            {index + 1}
                        </div>

                        <div className="flex-auto py-0.5">
                            <div className="flex items-center justify-between gap-x-3">
                                <span className="text-sm font-semibold leading-6 text-foreground">
                                    {item.title}
                                </span>
                                <time className="flex-none text-xs text-muted-foreground">
                                    {item.time}
                                </time>
                            </div>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className={cn("text-[10px] font-medium border-0", typeColors[item.type])}>
                                    {item.type.toUpperCase()}
                                </Badge>
                                {item.place && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {item.place.name}
                                    </span>
                                )}
                                {item.memo && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <AlignLeft className="w-3 h-3" /> 메모
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">오늘 예정된 일정이 없습니다.</p>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                        <DialogDescription>일정 상세 정보입니다.</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {selectedItem && (
                            <div className="space-y-4 mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">시간:</span>
                                    <span>{selectedItem.time}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">유형:</span>
                                    <Badge variant="secondary" className={cn("text-xs font-medium border-0", typeColors[selectedItem.type])}>
                                        {typeLabels[selectedItem.type] || selectedItem.type.toUpperCase()}
                                    </Badge>
                                </div>

                                {selectedItem.place && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">장소:</span>
                                        <span>{selectedItem.place.name}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">메모:</span>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                                        {selectedItem.memo || "메모가 없습니다."}
                                    </div>
                                </div>

                                {/* 연동된 지출 목록 */}
                                <div className="grid gap-2 border-t pt-4">
                                    <Label className="text-sm font-medium">연동된 지출</Label>
                                    {loadingExpenses ? (
                                        <div className="flex justify-center py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        </div>
                                    ) : linkedExpenses.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {linkedExpenses.map((expense) => {
                                                const isKRW = expense.currency === 'KRW';
                                                return (
                                                    <div
                                                        key={expense.id}
                                                        className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium">{expense.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {expense.category}
                                                            </p>
                                                        </div>
                                                        <div className="font-semibold">
                                                            {isKRW ? '₩' : 'A$'}{expense.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-1">
                                            연동된 지출이 없습니다.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <AddExpenseDialog
                                        trigger={
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <Plus className="w-3.5 h-3.5" />
                                                비용 추가
                                            </Button>
                                        }
                                        initialData={{
                                            title: selectedItem.title,
                                            date: new Date().toISOString().split('T')[0],
                                            category: mapToExpenseCategory(selectedItem.type),
                                            city: currentCity,
                                            // 홈 화면에서도 이 일정과 지출이 연동되도록 scheduleId 설정
                                            scheduleId: selectedItem.id,
                                        }}
                                        onExpenseAdded={() => {
                                            alert('지출이 추가되었습니다.');
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

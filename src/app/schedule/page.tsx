"use client";

import { useState, useEffect, useMemo } from "react";
import { CityFilter } from "@/components/schedule/CityFilter";
import { DayFilter } from "@/components/schedule/DayFilter";
import { ScheduleList, ScheduleItemData, ScheduleType } from "@/components/schedule/ScheduleList";
import { AddScheduleDialog } from "@/components/schedule/AddScheduleDialog";
import { EditScheduleDialog } from "@/components/schedule/EditScheduleDialog";
import { supabase } from "@/lib/supabase";
import { Loader2, Search, ArrowUpDown, Clock, MapPin, AlignLeft, Plus } from "lucide-react";
import { useTrip } from "@/contexts/TripContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseCategory, ExpenseData } from "@/components/expenses/ExpenseList";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addDays, isAfter, parse, set } from "date-fns";

// Helper to format HH:MM:SS to HH:MM AM/PM
const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10); // Handle potential seconds
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes.padStart(2, '0')} ${ampm}`;
};

const CITIES = ["전체", "시드니", "멜버른"];

const mapToExpenseCategory = (type: ScheduleType): ExpenseCategory => {
    switch (type) {
        case 'food': return 'food';
        case 'move': return 'transport';
        case 'shop': return 'shopping';
        case 'view':
        case 'kids': return 'activity';
        default: return 'etc';
    }
};

export default function SchedulePage() {
    const [items, setItems] = useState<ScheduleItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
    const { selectedTripId, selectedTrip } = useTrip();

    const [selectedCity, setSelectedCity] = useState("전체");
    const [selectedDay, setSelectedDay] = useState<number | "all">("all");
    const [sortBy, setSortBy] = useState<"time" | "city" | "completed">("time");
    const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "incomplete">("all");

    // Edit Dialog State
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItemData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    // Detail Dialog State
    const [detailSchedule, setDetailSchedule] = useState<ScheduleItemData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // 연동된 지출 State
    const [linkedExpenses, setLinkedExpenses] = useState<ExpenseData[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    // 상세 모달 열릴 때 지출 가져오기
    useEffect(() => {
        if (detailSchedule && detailDialogOpen) {
            fetchLinkedExpenses(detailSchedule.id);
        } else {
            setLinkedExpenses([]);
        }
    }, [detailSchedule, detailDialogOpen]);

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

    useEffect(() => {
        if (selectedTripId) {
            fetchSchedules();
            fetchTripInfo();
        }
    }, [selectedTripId, selectedTrip]);

    // Auto-complete past schedule items
    useEffect(() => {
        if (!tripStartDate || items.length === 0) return;

        const now = new Date();
        const itemsToComplete: ScheduleItemData[] = [];

        items.forEach(item => {
            if (item.isCompleted) return; // Skip already completed
            if (!item.rawTime) return;

            // Calculate actual date/time for this schedule item
            const itemDate = addDays(tripStartDate, item.day - 1);
            const [hours, minutes] = item.rawTime.split(':').map(Number);
            const itemDateTime = set(itemDate, { hours, minutes, seconds: 0 });

            // If current time is after the scheduled time, mark as complete
            if (isAfter(now, itemDateTime)) {
                itemsToComplete.push(item);
            }
        });

        // Auto-complete past items
        if (itemsToComplete.length > 0) {
            itemsToComplete.forEach(async (item) => {
                // Optimistic update
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, isCompleted: true } : i
                ));

                // Update in database
                await supabase
                    .from('schedules')
                    .update({ is_completed: true })
                    .eq('id', item.id);
            });
        }
    }, [items, tripStartDate]);

    async function fetchTripInfo() {
        if (selectedTrip && selectedTrip.start_date) {
            setTripStartDate(new Date(selectedTrip.start_date));
        }
    }

    async function fetchSchedules() {
        if (!selectedTripId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('schedules')
                .select(`
                    *,
                    place:places(id, name, category)
                `)
                .eq('trip_id', selectedTripId)
                .order('day_number', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) {
                console.error('Error fetching schedules:', error);
            } else if (data) {
                const formattedData: ScheduleItemData[] = data.map((item: any) => ({
                    id: item.id,
                    day: item.day_number,
                    city: item.city,
                    time: formatTime(item.start_time),
                    rawTime: item.start_time,
                    title: item.title,
                    type: item.type as ScheduleType,
                    memo: item.memo,
                    isCompleted: item.is_completed || false,
                    place_id: item.place_id,
                    place: item.place ? {
                        id: item.place.id,
                        name: item.place.name,
                        category: item.place.category,
                    } : null,
                }));
                setItems(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    const maxDay = useMemo(() => {
        if (items.length === 0) return 30;
        const max = Math.max(...items.map(item => item.day));
        return Math.max(max, 30); // 최소 30일은 보장
    }, [items]);

    const filteredItems = useMemo(() => {
        let filtered = items.filter((item) => {
            const cityMatch = selectedCity === "전체" || item.city === selectedCity;
            const dayMatch = selectedDay === "all" || item.day === selectedDay;
            const completionMatch = completionFilter === "all" ||
                (completionFilter === "completed" && item.isCompleted) ||
                (completionFilter === "incomplete" && !item.isCompleted);
            return cityMatch && dayMatch && completionMatch;
        });

        // 정렬 적용
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "time":
                    if (!a.rawTime || !b.rawTime) return 0;
                    return a.rawTime.localeCompare(b.rawTime);
                case "city":
                    return a.city.localeCompare(b.city, "ko");
                case "completed":
                    return (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [items, selectedCity, selectedDay, sortBy, completionFilter]);

    async function handleToggleComplete(item: ScheduleItemData) {
        const newValue = !item.isCompleted;

        // Optimistic update
        setItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isCompleted: newValue } : i
        ));

        try {
            const { error } = await supabase
                .from('schedules')
                .update({ is_completed: newValue })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating completion:', error);
                // Revert on error
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, isCompleted: !newValue } : i
                ));
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-background">
            <div className="flex-none px-4 py-2 space-y-2 bg-background z-10 sticky top-0 border-b">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">여행 일정</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-1">{filteredItems.length}개</span>
                        <AddScheduleDialog onScheduleAdded={fetchSchedules} />
                    </div>
                </div>

                <CityFilter
                    cities={CITIES}
                    selectedCity={selectedCity}
                    onSelectCity={(city) => {
                        setSelectedCity(city);
                        setSelectedDay("all");
                    }}
                />

                <DayFilter
                    days={maxDay}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />

                {/* 필터 및 정렬 */}
                <div className="flex justify-end gap-2">
                    <Select value={sortBy} onValueChange={(value: "time" | "city" | "completed") => setSortBy(value)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                            <ArrowUpDown className="w-3 h-3 mr-2" />
                            <SelectValue placeholder="정렬" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="time">시간순</SelectItem>
                            <SelectItem value="city">도시순</SelectItem>
                            <SelectItem value="completed">완료 여부</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-1 bg-muted p-1 rounded-lg h-8 items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 px-2 text-[10px] rounded-md",
                                completionFilter === "all" && "bg-background shadow-sm"
                            )}
                            onClick={() => setCompletionFilter("all")}
                        >
                            전체
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 px-2 text-[10px] rounded-md",
                                completionFilter === "completed" && "bg-background shadow-sm"
                            )}
                            onClick={() => setCompletionFilter("completed")}
                        >
                            완료
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 px-2 text-[10px] rounded-md",
                                completionFilter === "incomplete" && "bg-background shadow-sm"
                            )}
                            onClick={() => setCompletionFilter("incomplete")}
                        >
                            미완료
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ScheduleList
                        items={filteredItems}
                        tripStartDate={tripStartDate}
                        onItemClick={(item) => {
                            setDetailSchedule(item);
                            setDetailDialogOpen(true);
                        }}
                        onToggleComplete={handleToggleComplete}
                    />
                )}
            </div>

            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-[480px] max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{detailSchedule?.title}</DialogTitle>
                        <DialogDescription>일정 상세 정보입니다.</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
                        {detailSchedule && (
                            <>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">시간:</span>
                                    <span>{detailSchedule.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">도시:</span>
                                    <span>{detailSchedule.city}</span>
                                </div>
                                {detailSchedule.place && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">장소:</span>
                                        <span>{detailSchedule.place.name}</span>
                                    </div>
                                )}
                                {detailSchedule.memo && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-muted-foreground">메모:</span>
                                        </div>
                                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                                            {detailSchedule.memo}
                                        </div>
                                    </div>
                                )}

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
                            </>
                        )}
                    </div>
                    <div className="flex justify-between gap-2 flex-shrink-0 border-t pt-4">
                        <AddExpenseDialog
                            trigger={
                                <Button variant="outline" className="gap-1">
                                    <Plus className="w-4 h-4" />
                                    비용 추가
                                </Button>
                            }
                            initialData={{
                                title: detailSchedule?.title || "",
                                date: new Date().toISOString().split('T')[0],
                                category: detailSchedule ? mapToExpenseCategory(detailSchedule.type) : 'etc',
                                city: detailSchedule?.city || "시드니",
                                scheduleId: detailSchedule?.id,
                            }}
                            onExpenseAdded={() => {
                                alert('지출이 추가되었습니다.');
                            }}
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDetailDialogOpen(false);
                                    setDetailSchedule(null);
                                }}
                            >
                                닫기
                            </Button>
                            <Button
                                onClick={() => {
                                    if (detailSchedule) {
                                        setEditingSchedule(detailSchedule);
                                        setEditDialogOpen(true);
                                    }
                                    setDetailDialogOpen(false);
                                }}
                            >
                                수정하기
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <EditScheduleDialog
                schedule={editingSchedule}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onScheduleUpdated={fetchSchedules}
            />
        </div>
    );
}

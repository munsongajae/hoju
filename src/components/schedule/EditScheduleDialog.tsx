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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Plus, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScheduleType, ScheduleItemData } from "./ScheduleList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseData, ExpenseCategory } from "@/components/expenses/ExpenseList";
import { useTrip } from "@/contexts/TripContext";
import { addDays, format, differenceInCalendarDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface EditScheduleDialogProps {
    schedule: ScheduleItemData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScheduleUpdated: () => void;
}

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

export function EditScheduleDialog({
    schedule,
    open,
    onOpenChange,
    onScheduleUpdated
}: EditScheduleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form States
    const [day, setDay] = useState("1");
    const [city, setCity] = useState("시드니");
    const [startTime, setStartTime] = useState("12:00");
    const [title, setTitle] = useState("");
    const [type, setType] = useState<ScheduleType>("view");
    const [memo, setMemo] = useState("");
    const [placeId, setPlaceId] = useState<string>("none");
    const [places, setPlaces] = useState<Array<{ id: string; name: string }>>([]);
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
    const [placeSearchQuery, setPlaceSearchQuery] = useState("");

    // Date Logic
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // 연동된 지출
    const [linkedExpenses, setLinkedExpenses] = useState<ExpenseData[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    // Fetch Trip Start Date
    const { selectedTrip } = useTrip();
    useEffect(() => {
        if (open && selectedTrip && selectedTrip.start_date) {
            setTripStartDate(new Date(selectedTrip.start_date));
        }
    }, [open, selectedTrip]);

    // Fetch places when dialog opens or city changes
    const { selectedTripId } = useTrip();
    useEffect(() => {
        if (open && selectedTripId) {
            fetchPlaces();
        }
    }, [open, selectedTripId, city]);

    const fetchPlaces = async () => {
        if (!selectedTripId) return;
        try {
            const { data, error } = await supabase
                .from("places")
                .select("id, name")
                .eq("trip_id", selectedTripId)
                .eq("city", city)
                .order("name");

            if (error) {
                console.error("Error fetching places:", error);
                return;
            }

            if (data) {
                setPlaces(data);
            }
        } catch (err) {
            console.error("Failed to fetch places:", err);
        }
    };

    // Populate form when schedule changes
    useEffect(() => {
        if (schedule) {
            setDay(String(schedule.day));
            setCity(schedule.city);
            setTitle(schedule.title);
            setType(schedule.type);
            setMemo(schedule.memo || "");
            setPlaceId((schedule as any).place_id || "none");

            // Calculate date if tripStartDate is available
            if (tripStartDate) {
                const dayNum = parseInt(String(schedule.day));
                if (!isNaN(dayNum) && dayNum > 0) {
                    setSelectedDate(addDays(tripStartDate, dayNum - 1));
                }
            }

            // Convert time back to HH:MM format for input
            // schedule.time is like "10:00 AM"
            const timeParts = schedule.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
                let h = parseInt(timeParts[1]);
                const m = timeParts[2];
                const ampm = timeParts[3].toUpperCase();
                if (ampm === "PM" && h !== 12) h += 12;
                if (ampm === "AM" && h === 12) h = 0;
                setStartTime(`${String(h).padStart(2, '0')}:${m}`);
            }

            // 연동된 지출 가져오기
            fetchLinkedExpenses(schedule.id);
        }
    }, [schedule, tripStartDate]);

    // 연동된 지출 가져오기
    const fetchLinkedExpenses = async (scheduleId: string) => {
        setLoadingExpenses(true);
        try {
            const { data, error } = await supabase
                .from("expenses")
                .select("*")
                .eq("schedule_id", scheduleId)
                .order("date", { ascending: false });

            if (error) {
                console.error("Error fetching linked expenses:", error);
                return;
            }

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
            console.error("Unexpected error:", err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    // Sync Date -> Day
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date && tripStartDate) {
            const diff = differenceInCalendarDays(date, tripStartDate);
            // Day 1 is start date. diff 0 -> Day 1.
            const newDay = diff + 1;
            if (newDay > 0) setDay(newDay.toString());
        }
    };

    // Sync Day -> Date
    const handleDayChange = (val: string) => {
        setDay(val);
        const dayNum = parseInt(val);
        if (!isNaN(dayNum) && dayNum > 0 && tripStartDate) {
            setSelectedDate(addDays(tripStartDate, dayNum - 1));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedule) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("schedules")
                .update({
                    day_number: parseInt(day),
                    city,
                    start_time: startTime,
                    title,
                    type,
                    memo,
                    place_id: placeId === "none" ? null : placeId,
                })
                .eq('id', schedule.id);

            if (error) throw error;

            onOpenChange(false);
            onScheduleUpdated();
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert("일정 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!schedule) return;
        if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return;

        setDeleting(true);
        try {
            const { error } = await supabase
                .from("schedules")
                .delete()
                .eq('id', schedule.id);

            if (error) throw error;

            onOpenChange(false);
            onScheduleUpdated();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert("일정 삭제에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] !flex !flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>일정 수정</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0">
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>날짜 선택</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !selectedDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? (
                                                format(selectedDate, "yy.MM.dd (EEE)", { locale: ko })
                                            ) : (
                                                <span>날짜 선택</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-day">Day</Label>
                                <Input
                                    id="edit-day"
                                    type="number"
                                    min="1"
                                    value={day}
                                    onChange={(e) => handleDayChange(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-city">도시</Label>
                                <Select value={city} onValueChange={(value) => {
                                    setCity(value);
                                    setPlaceId("none"); // 도시 변경 시 장소 초기화
                                    setPlaceSearchQuery(""); // 검색 쿼리도 초기화
                                }}>
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
                                <Label htmlFor="edit-time">시간</Label>
                                <Input
                                    id="edit-time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-place">장소 연동 (선택)</Label>
                            <Popover open={placeSearchOpen} onOpenChange={setPlaceSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {placeId === "none" ? (
                                            <span className="text-muted-foreground">장소를 선택하세요</span>
                                        ) : (
                                            places.find((place) => place.id === placeId)?.name || "장소를 선택하세요"
                                        )}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <div className="flex items-center border-b px-3">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <Input
                                            placeholder="장소 검색..."
                                            value={placeSearchQuery}
                                            onChange={(e) => setPlaceSearchQuery(e.target.value)}
                                            className="border-0 focus-visible:ring-0"
                                        />
                                        {placeSearchQuery && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => setPlaceSearchQuery("")}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        <div
                                            className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                                            onClick={() => {
                                                setPlaceId("none");
                                                setPlaceSearchOpen(false);
                                                setPlaceSearchQuery("");
                                            }}
                                        >
                                            장소 없음
                                        </div>
                                        {places
                                            .filter((place) =>
                                                place.name.toLowerCase().includes(placeSearchQuery.toLowerCase())
                                            )
                                            .map((place) => (
                                                <div
                                                    key={place.id}
                                                    className={cn(
                                                        "px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm",
                                                        placeId === place.id && "bg-accent"
                                                    )}
                                                    onClick={() => {
                                                        setPlaceId(place.id);
                                                        setPlaceSearchOpen(false);
                                                        setPlaceSearchQuery("");
                                                    }}
                                                >
                                                    {place.name}
                                                </div>
                                            ))}
                                        {places.filter((place) =>
                                            place.name.toLowerCase().includes(placeSearchQuery.toLowerCase())
                                        ).length === 0 && (
                                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">일정명</Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 오페라하우스 투어"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">유형</Label>
                            <Select value={type} onValueChange={(v) => setType(v as ScheduleType)}>
                                <SelectTrigger id="edit-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">관광 (View)</SelectItem>
                                    <SelectItem value="food">식사 (Food)</SelectItem>
                                    <SelectItem value="move">이동 (Move)</SelectItem>
                                    <SelectItem value="rest">휴식/숙소 (Rest)</SelectItem>
                                    <SelectItem value="shop">쇼핑 (Shop)</SelectItem>
                                    <SelectItem value="kids">아이 (Kids)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-memo">메모</Label>
                            <Textarea
                                id="edit-memo"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="세부 내용..."
                                className="min-h-[100px] max-h-[200px]"
                            />
                        </div>

                        {/* 연동된 지출 목록 */}
                        {schedule && (
                            <div className="grid gap-2 border-t pt-4">
                                <Label className="text-sm font-medium">연동된 지출</Label>
                                {loadingExpenses ? (
                                    <div className="flex justify-center py-4">
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
                                                            {format(expense.date, "MM/dd")} · {expense.city}
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
                                    <p className="text-sm text-muted-foreground py-2">
                                        연동된 지출이 없습니다.
                                    </p>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between flex-shrink-0">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                삭제
                            </Button>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <AddExpenseDialog
                                    trigger={
                                        <Button type="button" variant="outline" className="flex-1 sm:flex-none">
                                            <Plus className="mr-2 h-4 w-4" />
                                            비용 추가
                                        </Button>
                                    }
                                    initialData={{
                                        title,
                                        date: new Date().toISOString().split('T')[0], // Default to today
                                        category: mapToExpenseCategory(type),
                                        city,
                                        scheduleId: schedule?.id // 일정과 연동
                                    }}
                                    onExpenseAdded={() => {
                                        if (schedule?.id) {
                                            fetchLinkedExpenses(schedule.id);
                                        }
                                        alert('지출이 추가되었습니다.');
                                    }}
                                />
                                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    저장하기
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

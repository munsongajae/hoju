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
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScheduleType, ScheduleItemData } from "./ScheduleList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseCategory } from "@/components/expenses/ExpenseList";
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

    // Date Logic
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Fetch Trip Start Date
    useEffect(() => {
        const fetchTrip = async () => {
            // Assuming single trip for now or fetching the one related to schedule if possible
            // But schedule doesn't have trip_id in the interface usually? 
            // Actually AddScheduleDialog fetches the single trip. We'll do the same.
            const { data } = await supabase.from('trips').select('start_date').limit(1).single();
            if (data && data.start_date) {
                setTripStartDate(new Date(data.start_date));
            }
        };
        if (open) fetchTrip();
    }, [open]);

    // Populate form when schedule changes
    useEffect(() => {
        if (schedule) {
            setDay(String(schedule.day));
            setCity(schedule.city);
            setTitle(schedule.title);
            setType(schedule.type);
            setMemo(schedule.memo || "");

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
        }
    }, [schedule, tripStartDate]);

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>일정 수정</DialogTitle>
                </DialogHeader>
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
                                max="30"
                                value={day}
                                onChange={(e) => handleDayChange(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        />
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
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
                                    city
                                }}
                                onExpenseAdded={() => {
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
            </DialogContent>
        </Dialog>
    );
}

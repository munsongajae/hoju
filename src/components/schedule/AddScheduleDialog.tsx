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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScheduleType } from "./ScheduleList";
import { addDays, format, differenceInCalendarDays } from "date-fns";
import { useTrip } from "@/contexts/TripContext";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddScheduleDialogProps {
    onScheduleAdded: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialData?: {
        title?: string;
        city?: string;
        memo?: string;
    };
    trigger?: React.ReactNode;
}

export function AddScheduleDialog({
    onScheduleAdded,
    open,
    onOpenChange,
    initialData,
    trigger
}: AddScheduleDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { selectedTripId, selectedTrip } = useTrip();
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);

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
    const [day, setDay] = useState("1");
    const [city, setCity] = useState("시드니");
    const [startTime, setStartTime] = useState("12:00");
    const [title, setTitle] = useState("");
    const [type, setType] = useState<ScheduleType>("view");
    const [memo, setMemo] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Initialize with initialData when opening
    useEffect(() => {
        if (finalOpen && initialData) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.city) setCity(initialData.city);
            if (initialData.memo) setMemo(initialData.memo);
        }
    }, [finalOpen, initialData, isControlled]);

    // Fetch trip start date
    useEffect(() => {
        if (finalOpen && selectedTrip) {
            if (selectedTrip.start_date) {
                const start = new Date(selectedTrip.start_date);
                setTripStartDate(start);
                // Initialize selectedDate based on current day
                const currentDay = parseInt(day);
                if (!isNaN(currentDay) && currentDay > 0) {
                    setSelectedDate(addDays(start, currentDay - 1));
                }
            }
        }
    }, [finalOpen, selectedTrip, day]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTripId) {
            alert("여행을 선택해주세요.");
            return;
        }
        setLoading(true);

        try {
            const { error } = await supabase.from("schedules").insert([{
                trip_id: selectedTripId,
                day_number: parseInt(day),
                city,
                start_time: startTime,
                title,
                type,
                memo,
            }]);

            if (error) throw error;

            setTitle("");
            setMemo("");
            setFinalOpen(false);
            onScheduleAdded();
        } catch (error) {
            console.error("Error adding schedule:", error);
            alert("일정 추가에 실패했습니다.");
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
                    <DialogTitle>새 일정 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

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
                            <Label htmlFor="day">Day</Label>
                            <Input
                                id="day"
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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="time">시간</Label>
                        <Input
                            id="time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">일정명</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 오페라하우스 투어"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">유형</Label>
                        <Select value={type} onValueChange={(v) => setType(v as ScheduleType)}>
                            <SelectTrigger id="type">
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
                        <Label htmlFor="memo">메모</Label>
                        <Textarea
                            id="memo"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="세부 내용..."
                        />
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

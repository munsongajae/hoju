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
import { Plus, Loader2, CalendarIcon, Search, X } from "lucide-react";
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
        day?: number;
    };
    initialDay?: number;
    trigger?: React.ReactNode;
}

export function AddScheduleDialog({
    onScheduleAdded,
    open,
    onOpenChange,
    initialData,
    initialDay,
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
    const [placeId, setPlaceId] = useState<string>("none");
    const [places, setPlaces] = useState<Array<{ id: string; name: string }>>([]);
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
    const [placeSearchQuery, setPlaceSearchQuery] = useState("");

    // Initialize with initialData when opening
    useEffect(() => {
        if (finalOpen) {
            if (initialData) {
                if (initialData.title) setTitle(initialData.title);
                if (initialData.city) setCity(initialData.city);
                if (initialData.memo) setMemo(initialData.memo);
                if (initialData.day !== undefined) {
                    setDay(initialData.day.toString());
                }
            }
            if (initialDay !== undefined) {
                setDay(initialDay.toString());
            }
        } else {
            // Reset when closing
            setTitle("");
            setMemo("");
            setPlaceId("none");
        }
    }, [finalOpen, initialData, initialDay, isControlled]);

    // Fetch trip start date and places
    useEffect(() => {
        if (finalOpen && selectedTrip) {
            if (selectedTrip.start_date) {
                const start = new Date(selectedTrip.start_date);
                setTripStartDate(start);
                // Initialize selectedDate based on current day
                const currentDay = parseInt(day);
                if (!isNaN(currentDay)) {
                    setSelectedDate(addDays(start, currentDay - 1));
                }
            }
        }
    }, [finalOpen, selectedTrip, day]);

    // Fetch places when dialog opens
    useEffect(() => {
        if (finalOpen && selectedTripId) {
            fetchPlaces();
        }
    }, [finalOpen, selectedTripId, city]);

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

    // Sync Date -> Day
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date && tripStartDate) {
            const diff = differenceInCalendarDays(date, tripStartDate);
            // Day 1 is start date. diff 0 -> Day 1.
            const newDay = diff + 1;
            setDay(newDay.toString());
        }
    };

    // Sync Day -> Date
    const handleDayChange = (val: string) => {
        setDay(val);
        const dayNum = parseInt(val);
        if (!isNaN(dayNum) && tripStartDate) {
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
                place_id: placeId === "none" ? null : placeId,
            }]);

            if (error) throw error;

            setTitle("");
            setMemo("");
            setPlaceId("none");
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
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] !flex !flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>새 일정 추가</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0">
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
                                    value={day}
                                    onChange={(e) => handleDayChange(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">도시</Label>
                                <Select value={city} onValueChange={(value) => {
                                    setCity(value);
                                    setPlaceId("none"); // 도시 변경 시 장소 초기화
                                    setPlaceSearchQuery(""); // 검색 쿼리도 초기화
                                }}>
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
                            <Label htmlFor="place">장소 연동 (선택)</Label>
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
                                className="min-h-[100px] max-h-[200px]"
                            />
                        </div>

                        <DialogFooter className="flex-shrink-0">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                추가하기
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

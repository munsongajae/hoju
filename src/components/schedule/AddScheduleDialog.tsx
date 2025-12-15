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
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScheduleType } from "./ScheduleList";

interface AddScheduleDialogProps {
    onScheduleAdded: () => void;
}

export function AddScheduleDialog({ onScheduleAdded }: AddScheduleDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tripId, setTripId] = useState<string>("");

    // Form States
    const [day, setDay] = useState("1");
    const [city, setCity] = useState("시드니");
    const [startTime, setStartTime] = useState("12:00");
    const [title, setTitle] = useState("");
    const [type, setType] = useState<ScheduleType>("view");
    const [memo, setMemo] = useState("");

    // Fetch a trip ID (just grab the first one for MVP)
    useEffect(() => {
        if (open) {
            const fetchTrip = async () => {
                const { data } = await supabase.from('trips').select('id').limit(1).single();
                if (data) setTripId(data.id);
            }
            fetchTrip();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tripId) {
            alert("여행 정보를 찾을 수 없습니다.");
            return;
        }
        setLoading(true);

        try {
            const { error } = await supabase.from("schedules").insert([{
                trip_id: tripId,
                day_number: parseInt(day),
                city,
                start_time: startTime,
                title,
                type,
                memo,
            }]);

            if (error) throw error;

            // Reset features, keep city/day for convenience
            setTitle("");
            setMemo("");
            setOpen(false);
            onScheduleAdded();
        } catch (error) {
            console.error("Error adding schedule:", error);
            alert("일정 추가에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full">
                    <Plus className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>새 일정 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="day">Day</Label>
                            <Input
                                id="day"
                                type="number"
                                min="1"
                                max="30"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                required
                            />
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

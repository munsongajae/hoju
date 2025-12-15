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
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScheduleType, ScheduleItemData } from "./ScheduleList";

interface EditScheduleDialogProps {
    schedule: ScheduleItemData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScheduleUpdated: () => void;
}

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

    // Populate form when schedule changes
    useEffect(() => {
        if (schedule) {
            setDay(String(schedule.day));
            setCity(schedule.city);
            setTitle(schedule.title);
            setType(schedule.type);
            setMemo(schedule.memo || "");
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
    }, [schedule]);

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
                            <Label htmlFor="edit-day">Day</Label>
                            <Input
                                id="edit-day"
                                type="number"
                                min="1"
                                max="30"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                required
                            />
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
        </Dialog>
    );
}

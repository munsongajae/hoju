"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Loader2, Smile, Zap, Coffee, Moon, ThermometerSun, Meh, Edit, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

interface DiaryEntry {
    id: string;
    day_number: number;
    date: string;
    title: string;
    content: string;
    mood: string;
    highlight: string;
}

const MOODS = [
    { value: "happy", label: "행복", icon: Smile, color: "bg-yellow-100 text-yellow-700" },
    { value: "excited", label: "신남", icon: Zap, color: "bg-orange-100 text-orange-700" },
    { value: "relaxed", label: "편안", icon: Coffee, color: "bg-green-100 text-green-700" },
    { value: "tired", label: "피곤", icon: Moon, color: "bg-blue-100 text-blue-700" },
    { value: "sick", label: "아픔", icon: ThermometerSun, color: "bg-red-100 text-red-700" },
    { value: "normal", label: "보통", icon: Meh, color: "bg-zinc-100 text-zinc-700" },
];

export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tripId, setTripId] = useState<string | null>(null);
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formMoods, setFormMoods] = useState<string[]>(["normal"]);
    const [formHighlight, setFormHighlight] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Load trip info
            const { data: tripData } = await supabase
                .from("trips")
                .select("*")
                .limit(1)
                .single();

            if (tripData) {
                setTripId(tripData.id);
                setTripStartDate(parseISO(tripData.start_date));
            }

            // Load diary entries
            const { data: diaryData, error } = await supabase
                .from("diaries")
                .select("*")
                .order("date", { ascending: false });

            if (error) {
                console.error("Error loading diaries:", error);
            } else if (diaryData) {
                setEntries(diaryData);
            }
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    }

    function openNewEntry() {
        setEditingId(null);
        setFormDate(format(new Date(), "yyyy-MM-dd"));
        setFormTitle("");
        setFormContent("");
        setFormMoods(["normal"]);
        setFormHighlight("");
        setDialogOpen(true);
    }

    function openEditEntry(entry: DiaryEntry) {
        setEditingId(entry.id);
        setFormDate(entry.date);
        setFormTitle(entry.title || "");
        setFormContent(entry.content || "");
        setFormMoods(entry.mood ? entry.mood.split(",") : ["normal"]);
        setFormHighlight(entry.highlight || "");
        setDialogOpen(true);
    }

    async function handleSave() {
        if (!tripId || !tripStartDate) return;

        setSaving(true);
        try {
            const entryDate = parseISO(formDate);
            const diffDays = differenceInDays(entryDate, tripStartDate);
            const isTripStarted = diffDays >= 0;
            const dayNum = isTripStarted ? diffDays + 1 : Math.abs(diffDays);

            const diaryData = {
                trip_id: tripId,
                day_number: isTripStarted ? dayNum : -dayNum, // 음수는 D-day 표시용
                date: formDate,
                title: formTitle || (isTripStarted ? `Day ${dayNum} 일기` : `D-${dayNum} 준비 일기`),
                content: formContent,
                mood: formMoods.join(","),
                highlight: formHighlight,
                updated_at: new Date().toISOString(),
            };

            if (editingId) {
                const { error } = await supabase
                    .from("diaries")
                    .update(diaryData)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("diaries")
                    .insert([diaryData]);
                if (error) throw error;
            }

            setDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error("Failed to save diary:", err);
            alert(`저장 실패: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!editingId) return;

        const confirmed = window.confirm("정말 이 일기를 삭제하시겠습니까?");
        if (!confirmed) return;

        setDeleting(true);
        try {
            const { error } = await supabase
                .from("diaries")
                .delete()
                .eq("id", editingId);

            if (error) throw error;

            setDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error("Failed to delete diary:", err);
            alert(`삭제 실패: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setDeleting(false);
        }
    }

    const getMoodInfo = (mood: string) => MOODS.find(m => m.value === mood) || MOODS[5];

    const toggleMood = (moodValue: string) => {
        setFormMoods(prev => {
            if (prev.includes(moodValue)) {
                // Prevent removing the last mood if there's only one
                if (prev.length === 1) return prev;
                return prev.filter(m => m !== moodValue);
            } else {
                return [...prev, moodValue];
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">여행 일기</h1>
                <Button onClick={openNewEntry} size="icon" className="h-8 w-8 rounded-full">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>아직 작성된 일기가 없습니다.</p>
                    <p className="text-sm">오늘의 여행을 기록해보세요!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {entries.map((entry) => {

                        return (
                            <Card
                                key={entry.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => openEditEntry(entry)}
                            >
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-bold">
                                                {entry.day_number > 0 ? `Day ${entry.day_number}` : `D-${Math.abs(entry.day_number)}`}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {format(parseISO(entry.date), "M월 d일 (EEE)", { locale: ko })}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {entry.mood.split(",").map(m => {
                                                const moodInfo = getMoodInfo(m);
                                                const MoodIcon = moodInfo.icon;
                                                return (
                                                    <Badge key={m} className={moodInfo.color + " border-0"}>
                                                        <MoodIcon className="w-3 h-3 mr-1" />
                                                        {moodInfo.label}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <h3 className="font-semibold mb-1">{entry.title}</h3>
                                    {entry.content && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {entry.content}
                                        </p>
                                    )}
                                    {entry.highlight && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                                            <Zap className="w-3 h-3" />
                                            <span className="font-medium">하이라이트:</span>
                                            <span>{entry.highlight}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "일기 수정" : "새 일기 작성"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>날짜</Label>
                            <Input
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>제목</Label>
                            <Input
                                placeholder="오늘의 제목"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>오늘의 기분</Label>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map(mood => {
                                    const Icon = mood.icon;
                                    return (
                                        <button
                                            key={mood.value}
                                            type="button"
                                            onClick={() => toggleMood(mood.value)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${formMoods.includes(mood.value)
                                                ? mood.color + " ring-2 ring-offset-1 ring-primary"
                                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {mood.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>오늘의 하이라이트 ⭐</Label>
                            <Input
                                placeholder="가장 기억에 남는 순간"
                                value={formHighlight}
                                onChange={(e) => setFormHighlight(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>일기 내용</Label>
                            <Textarea
                                placeholder="오늘 하루를 자유롭게 기록하세요..."
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                rows={6}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {editingId && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full sm:w-auto"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                삭제
                            </Button>
                        )}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
                                취소
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                저장
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

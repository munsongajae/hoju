"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Loader2, Edit, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useTrip } from "@/contexts/TripContext";
import { supabase } from "@/lib/supabase";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import Link from "next/link";

interface MemoItem {
    id: string;
    trip_id: string;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string;
}

export default function MemoPage() {
    const { selectedTripId } = useTrip();
    const [memos, setMemos] = useState<MemoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");

    useEffect(() => {
        if (selectedTripId) {
            loadMemos();
        } else {
            setMemos([]);
            setLoading(false);
        }
    }, [selectedTripId]);

    const loadMemos = async () => {
        if (!selectedTripId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("memos")
                .select("*")
                .eq("trip_id", selectedTripId)
                .order("updated_at", { ascending: false });

            if (error) {
                console.error("Error loading memos:", error);
            } else if (data) {
                setMemos(data);
            }
        } catch (err) {
            console.error("Failed to load memos:", err);
        } finally {
            setLoading(false);
        }
    };

    const openNewMemo = () => {
        setEditingId(null);
        setFormTitle("");
        setFormContent("");
        setDialogOpen(true);
    };

    const openEditMemo = (memo: MemoItem) => {
        setEditingId(memo.id);
        setFormTitle(memo.title);
        setFormContent(memo.content || "");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedTripId || !formTitle.trim()) return;

        setSaving(true);
        try {
            if (editingId) {
                // 수정
                const { data, error } = await supabase
                    .from("memos")
                    .update({
                        title: formTitle.trim(),
                        content: formContent || null,
                    })
                    .eq("id", editingId)
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    // 목록 업데이트
                    setMemos(memos.map(memo => memo.id === editingId ? data : memo));
                }
            } else {
                // 새 메모 추가
                const { data, error } = await supabase
                    .from("memos")
                    .insert([{
                        trip_id: selectedTripId,
                        title: formTitle.trim(),
                        content: formContent || null,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    // 목록에 추가
                    setMemos([data, ...memos]);
                }
            }

            setDialogOpen(false);
            setFormTitle("");
            setFormContent("");
            setEditingId(null);
        } catch (err) {
            console.error("Failed to save memo:", err);
            alert("메모 저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 메모를 삭제하시겠습니까?")) return;

        setDeleting(id);
        try {
            const { error } = await supabase
                .from("memos")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // 목록에서 제거
            setMemos(memos.filter(memo => memo.id !== id));
        } catch (err) {
            console.error("Failed to delete memo:", err);
            alert("메모 삭제에 실패했습니다.");
        } finally {
            setDeleting(null);
        }
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
            {/* 헤더 */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-2xl font-bold">메모</h1>
            </div>

            {/* 새 메모 추가 버튼 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openNewMemo} className="w-full" size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        새 메모 추가
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "메모 수정" : "새 메모"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">제목 *</Label>
                            <Input
                                id="title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="메모 제목을 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">내용</Label>
                            <Textarea
                                id="content"
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="메모 내용을 입력하세요..."
                                className="min-h-[200px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDialogOpen(false);
                                setFormTitle("");
                                setFormContent("");
                                setEditingId(null);
                            }}
                            disabled={saving}
                        >
                            취소
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formTitle.trim()}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    저장 중...
                                </>
                            ) : (
                                "저장"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 메모 목록 */}
            {memos.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-lg mb-2">메모가 없습니다</p>
                            <p className="text-sm">새 메모를 추가해보세요</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {memos.map((memo) => (
                        <Collapsible key={memo.id}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CollapsibleTrigger className="flex-1 text-left cursor-pointer">
                                            <div>
                                                <CardTitle className="text-lg mb-1">{memo.title}</CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(memo.updated_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                                                </p>
                                            </div>
                                        </CollapsibleTrigger>
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEditMemo(memo)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                                onClick={() => handleDelete(memo.id)}
                                                disabled={deleting === memo.id}
                                            >
                                                {deleting === memo.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CollapsibleContent>
                                    <CardContent>
                                        <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                                            {memo.content || <span className="italic">내용 없음</span>}
                                        </p>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </div>
            )}
        </div>
    );
}

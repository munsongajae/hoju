"use client";

import { useState, useEffect, useRef } from "react";
import { ChecklistGroup, ChecklistGroupData, ChecklistItemData } from "@/components/checklist/ChecklistGroup";
import { ManageChecklistDialog } from "@/components/checklist/ManageChecklistDialog";
import { AiChecklistDialog } from "@/components/checklist/AiChecklistDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, RefreshCw, Plus, Send, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { db, generateId } from "@/lib/db";
import { useTrip } from "@/contexts/TripContext";
import { differenceInCalendarDays } from "date-fns";
import { parseIsoToLocalDate } from "@/lib/localDate";

export default function ChecklistPage() {
    const [groups, setGroups] = useState<ChecklistGroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedTripId, selectedTrip } = useTrip();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: string; label: string; category: string } | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editNewCategory, setEditNewCategory] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [checklistData, setChecklistData] = useState<any[]>([]);

    // 빠른 직접 입력 상태
    const [quickInput, setQuickInput] = useState("");
    const [quickCategory, setQuickCategory] = useState("");
    const [quickNewCategory, setQuickNewCategory] = useState("");
    const [quickAdding, setQuickAdding] = useState(false);
    const quickInputRef = useRef<HTMLInputElement>(null);

    const tripDays = (() => {
        if (!selectedTrip?.start_date || !selectedTrip?.end_date) return undefined;
        const start = parseIsoToLocalDate(selectedTrip.start_date);
        const end = parseIsoToLocalDate(selectedTrip.end_date);
        return Math.max(1, differenceInCalendarDays(end, start) + 1);
    })();

    useEffect(() => {
        if (selectedTripId) {
            fetchChecklists();
        } else {
            setLoading(false);
            setGroups([]);
        }
    }, [selectedTripId]);

    // 카테고리 목록 변경시 빠른입력 카테고리 초기화
    useEffect(() => {
        if (groups.length > 0 && !quickCategory) {
            setQuickCategory(groups[0].title);
        }
    }, [groups]);

    async function fetchChecklists() {
        if (!selectedTripId) return;
        try {
            setLoading(true);
            const data = await db.checklists
                .where("trip_id")
                .equals(selectedTripId)
                .toArray();

            if (data) {
                setChecklistData(data);
                const grouped: Record<string, ChecklistItemData[]> = {};
                data.forEach((item: any) => {
                    const cat = item.category || "기타";
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push({ id: item.id, label: item.title, checked: item.is_completed });
                });
                const formattedGroups: ChecklistGroupData[] = Object.keys(grouped).map(category => ({
                    title: category,
                    items: grouped[category]
                }));
                setGroups(formattedGroups);
            }
        } catch (err) {
            console.error("Failed to fetch checklists:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleToggle = async (itemId: string, checked: boolean) => {
        setGroups(prev => prev.map(g => ({ ...g, items: g.items.map(i => i.id === itemId ? { ...i, checked } : i) })));
        try {
            await db.checklists.update(itemId, { is_completed: checked });
        } catch (err) {
            console.error("Failed to update checklist:", err);
            fetchChecklists();
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm("이 항목을 삭제하시겠습니까?")) return;
        setGroups(prev => prev.map(g => ({ ...g, items: g.items.filter(i => i.id !== itemId) })).filter(g => g.items.length > 0));
        try {
            await db.checklists.delete(itemId);
        } catch (err) {
            console.error("Failed to delete item:", err);
            fetchChecklists();
        }
    };

    // 완료 항목 일괄 삭제
    const handleDeleteCompleted = async () => {
        const completedIds = groups.flatMap(g => g.items.filter(i => i.checked).map(i => i.id));
        if (completedIds.length === 0) {
            alert("완료된 항목이 없습니다.");
            return;
        }
        if (!confirm(`완료된 항목 ${completedIds.length}개를 삭제하시겠습니까?`)) return;
        setGroups(prev =>
            prev.map(g => ({ ...g, items: g.items.filter(i => !i.checked) }))
                .filter(g => g.items.length > 0)
        );
        try {
            await db.checklists.bulkDelete(completedIds);
        } catch (err) {
            console.error("Failed to delete completed items:", err);
            fetchChecklists();
        }
    };

    // 카테고리 전체 삭제
    const handleDeleteCategory = async (category: string) => {
        const ids = groups.find(g => g.title === category)?.items.map(i => i.id) ?? [];
        if (!confirm(`"${category}" 카테고리의 항목 ${ids.length}개를 모두 삭제하시겠습니까?`)) return;
        setGroups(prev => prev.filter(g => g.title !== category));
        try {
            await db.checklists.bulkDelete(ids);
        } catch (err) {
            console.error("Failed to delete category:", err);
            fetchChecklists();
        }
    };

    // 전체 초기화
    const handleDeleteAll = async () => {
        const total = groups.reduce((sum, g) => sum + g.items.length, 0);
        if (total === 0) return;
        if (!confirm(`체크리스트 전체 ${total}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
        const allIds = groups.flatMap(g => g.items.map(i => i.id));
        setGroups([]);
        try {
            await db.checklists.bulkDelete(allIds);
        } catch (err) {
            console.error("Failed to delete all:", err);
            fetchChecklists();
        }
    };

    const handleEdit = (item: ChecklistItemData) => {
        const itemData = checklistData.find(d => d.id === item.id);
        if (itemData) {
            setEditingItem({ id: item.id, label: item.label, category: itemData.category || "기타" });
            setEditLabel(item.label);
            setEditCategory(itemData.category || "기타");
            setEditNewCategory("");
            setEditDialogOpen(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem || !editLabel) return;
        setEditLoading(true);
        try {
            const categoryToUse = editCategory === "new_category" ? editNewCategory : editCategory;
            if (!categoryToUse) return;
            setGroups(prev => prev.map(g => {
                if (g.title === editingItem.category) {
                    return { ...g, items: g.items.map(i => i.id === editingItem.id ? { ...i, label: editLabel } : i) };
                }
                return g;
            }));
            await db.checklists.update(editingItem.id, { title: editLabel, category: categoryToUse });
            setEditDialogOpen(false);
            fetchChecklists();
        } catch (err) {
            console.error("Failed to update checklist item:", err);
            fetchChecklists();
        } finally {
            setEditLoading(false);
        }
    };

    const handleQuickAdd = async () => {
        if (!quickInput.trim() || !selectedTripId) return;
        setQuickAdding(true);
        try {
            const categoryToUse = quickCategory === "new_category" ? quickNewCategory : (quickCategory || "기타");
            await db.checklists.add({
                id: generateId(),
                title: quickInput.trim(),
                category: categoryToUse,
                is_completed: false,
                trip_id: selectedTripId,
                created_at: new Date().toISOString(),
            });
            setQuickInput("");
            // 새 카테고리였다면 목록 refresh 후 그 카테고리 유지
            if (quickCategory === "new_category" && quickNewCategory) {
                setQuickCategory(quickNewCategory);
                setQuickNewCategory("");
            }
            fetchChecklists();
            quickInputRef.current?.focus();
        } catch (err) {
            console.error("Failed to add quick item:", err);
        } finally {
            setQuickAdding(false);
        }
    };

    const allCategories = groups.map(g => g.title);

    return (
        <div className="p-4 pb-28 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
                        <h1 className="text-2xl font-bold">체크리스트</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AiChecklistDialog
                        onSuccess={fetchChecklists}
                        categories={allCategories}
                        tripDays={tripDays}
                    />
                    <Button variant="ghost" size="icon" onClick={fetchChecklists}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* 일괄 삭제 버튼 */}
            {groups.length > 0 && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                        onClick={handleDeleteCompleted}
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        완료 항목 삭제
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                        onClick={handleDeleteAll}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        전체 초기화
                    </Button>
                </div>
            )}

            {/* 빠른 직접 입력 */}
            <div className="bg-card border rounded-xl p-3 shadow-sm space-y-2">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                    <Plus className="w-4 h-4" /> 빠른 항목 추가
                </p>
                <div className="flex gap-2">
                    <Select
                        value={quickCategory}
                        onValueChange={setQuickCategory}
                    >
                        <SelectTrigger className="w-[140px] text-sm shrink-0">
                            <SelectValue placeholder="카테고리" />
                        </SelectTrigger>
                        <SelectContent>
                            {allCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <SelectItem value="new_category">+ 새 카테고리</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        ref={quickInputRef}
                        placeholder="항목 이름 입력 후 Enter"
                        value={quickInput}
                        onChange={e => setQuickInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey && quickInput.trim() && !quickAdding) {
                                e.preventDefault();
                                handleQuickAdd();
                            }
                        }}
                        className="flex-1 text-sm"
                    />
                    <Button size="icon" onClick={handleQuickAdd} disabled={quickAdding || !quickInput.trim()} className="shrink-0">
                        {quickAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                {quickCategory === "new_category" && (
                    <Input
                        placeholder="새 카테고리 이름"
                        value={quickNewCategory}
                        onChange={e => setQuickNewCategory(e.target.value)}
                        className="text-sm"
                    />
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                    <p className="text-lg font-semibold">체크리스트가 비어있습니다.</p>
                    <p className="text-sm">위 입력창으로 직접 추가하거나,<br/><span className="text-purple-500 font-medium">AI 추천</span> 버튼으로 자동 생성해보세요!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map(group => (
                        <ChecklistGroup
                            key={group.title}
                            group={group}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onDeleteCategory={handleDeleteCategory}
                        />
                    ))}
                </div>
            )}

            <ManageChecklistDialog
                onSuccess={fetchChecklists}
                categories={allCategories}
            />

            {/* 수정 다이얼로그 */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>체크리스트 항목 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>카테고리</Label>
                            <Select value={editCategory} onValueChange={setEditCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map(g => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                    <SelectItem value="new_category">+ 새 카테고리 입력</SelectItem>
                                </SelectContent>
                            </Select>
                            {editCategory === "new_category" && (
                                <Input
                                    placeholder="새 카테고리 이름"
                                    value={editNewCategory}
                                    onChange={e => setEditNewCategory(e.target.value)}
                                    className="mt-2"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>아이템 이름</Label>
                            <Input
                                placeholder="예: 멀티탭 챙기기"
                                value={editLabel}
                                onChange={e => setEditLabel(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>취소</Button>
                        <Button onClick={handleSaveEdit} disabled={editLoading || !editLabel}>
                            {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

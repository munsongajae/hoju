"use client";

import { useState, useEffect } from "react";
import { ChecklistGroup, ChecklistGroupData, ChecklistItemData } from "@/components/checklist/ChecklistGroup";
import { ManageChecklistDialog } from "@/components/checklist/ManageChecklistDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/contexts/TripContext";

export default function ChecklistPage() {
    const [groups, setGroups] = useState<ChecklistGroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedTripId } = useTrip();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: string; label: string; category: string } | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editNewCategory, setEditNewCategory] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [checklistData, setChecklistData] = useState<any[]>([]);

    useEffect(() => {
        if (selectedTripId) {
            fetchChecklists();
        } else {
            setLoading(false);
            setGroups([]);
        }
    }, [selectedTripId]);

    async function fetchChecklists() {
        if (!selectedTripId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("checklists")
                .select("*")
                .eq("trip_id", selectedTripId)
                .order("id");

            if (error) {
                console.error("Error fetching checklists:", error);
            } else if (data) {
                setChecklistData(data);
                // Group by category
                const grouped: Record<string, ChecklistItemData[]> = {};

                data.forEach((item: any) => {
                    if (!grouped[item.category]) {
                        grouped[item.category] = [];
                    }
                    grouped[item.category].push({
                        id: item.id,
                        label: item.label,
                        checked: item.is_checked
                    });
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
        // 1. Optimistic UI Update
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                items: g.items.map((i) => i.id === itemId ? { ...i, checked } : i)
            }))
        );

        // 2. Supabase Update
        try {
            const { error } = await supabase
                .from("checklists")
                .update({ is_checked: checked })
                .eq("id", itemId);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to update checklist:", err);
            // Revert on error (optional, but good practice)
            fetchChecklists();
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm("이 항목을 삭제하시겠습니까?")) return;

        // 1. Optimistic UI Update
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                items: g.items.filter((i) => i.id !== itemId)
            })).filter(g => g.items.length > 0) // Remove empty groups
        );

        // 2. Supabase Delete
        try {
            const { error } = await supabase
                .from("checklists")
                .delete()
                .eq("id", itemId);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to delete item:", err);
            fetchChecklists();
        }
    };

    const handleEdit = (item: ChecklistItemData) => {
        const itemData = checklistData.find(d => d.id === item.id);
        if (itemData) {
            setEditingItem({ id: item.id, label: item.label, category: itemData.category });
            setEditLabel(item.label);
            setEditCategory(itemData.category);
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

            // 1. Optimistic UI Update
            setGroups((prev) =>
                prev.map((g) => {
                    if (g.title === editingItem.category) {
                        return {
                            ...g,
                            items: g.items.map((i) => 
                                i.id === editingItem.id ? { ...i, label: editLabel } : i
                            )
                        };
                    }
                    return g;
                })
            );

            // 2. Supabase Update
            const { error } = await supabase
                .from("checklists")
                .update({ 
                    label: editLabel,
                    category: categoryToUse
                })
                .eq("id", editingItem.id);

            if (error) throw error;

            setEditDialogOpen(false);
            fetchChecklists();
        } catch (err) {
            console.error("Failed to update checklist item:", err);
            fetchChecklists();
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="p-4 pb-24 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">체크리스트</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchChecklists}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>체크리스트가 비어있습니다.</p>
                    <p className="text-sm">DB에 데이터가 있는지 확인해주세요.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <ChecklistGroup
                            key={group.title}
                            group={group}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}


            <ManageChecklistDialog
                onSuccess={fetchChecklists}
                categories={groups.map(g => g.title)}
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
                                    {groups.map(g => (
                                        <SelectItem key={g.title} value={g.title}>{g.title}</SelectItem>
                                    ))}
                                    <SelectItem value="new_category">+ 새 카테고리 입력</SelectItem>
                                </SelectContent>
                            </Select>
                            {editCategory === "new_category" && (
                                <Input
                                    placeholder="새 카테고리 이름"
                                    value={editNewCategory}
                                    onChange={(e) => setEditNewCategory(e.target.value)}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>아이템 이름</Label>
                            <Input
                                placeholder="예: 멀티탭 챙기기"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
                            취소
                        </Button>
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

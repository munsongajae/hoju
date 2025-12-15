"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Edit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface ManageChecklistDialogProps {
    onSuccess: () => void;
    categories: string[];
}

export function ManageChecklistDialog({ onSuccess, categories }: ManageChecklistDialogProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "delete">("add");
    const [itemLabel, setItemLabel] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || "기타");
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);

    // For deletion
    const [deleteId, setDeleteId] = useState("");

    const handleAdd = async () => {
        if (!itemLabel) return;
        setLoading(true);
        try {
            const categoryToUse = selectedCategory === "new_category" ? newCategory : selectedCategory;
            if (!categoryToUse) return;

            const { error } = await supabase
                .from("checklists")
                .insert([{
                    label: itemLabel,
                    category: categoryToUse,
                    is_checked: false
                }]);

            if (error) throw error;

            setItemLabel("");
            setNewCategory("");
            setOpen(false);
            onSuccess();
        } catch (err) {
            console.error("Failed to add checklist item:", err);
            alert("추가 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="rounded-full shadow-lg fixed bottom-24 right-4 h-12 w-12 z-50">
                    <Plus className="w-6 h-6" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>체크리스트 아이템 추가</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>카테고리</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="new_category">+ 새 카테고리 입력</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedCategory === "new_category" && (
                            <Input
                                placeholder="새 카테고리 이름"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>아이템 이름</Label>
                        <Input
                            placeholder="예: 멀티탭 챙기기"
                            value={itemLabel}
                            onChange={(e) => setItemLabel(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
                    <Button onClick={handleAdd} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        추가
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

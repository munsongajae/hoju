"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Edit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/contexts/TripContext";

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
    const { selectedTripId } = useTrip();
    const itemLabelInputRef = useRef<HTMLInputElement>(null);

    // For deletion
    const [deleteId, setDeleteId] = useState("");

    // 다이얼로그가 열릴 때 입력 필드에 포커스
    useEffect(() => {
        if (open && itemLabelInputRef.current) {
            // 약간의 지연을 두어 다이얼로그 애니메이션이 완료된 후 포커스
            setTimeout(() => {
                itemLabelInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // 다이얼로그가 열릴 때 카테고리 초기화
    useEffect(() => {
        if (open && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [open, categories]);

    const handleAdd = async (closeAfterAdd: boolean = false) => {
        if (!itemLabel) return;
        if (!selectedTripId) {
            alert("여행을 선택해주세요.");
            return;
        }

        setLoading(true);
        try {
            const categoryToUse = selectedCategory === "new_category" ? newCategory : selectedCategory;
            if (!categoryToUse) return;

            const { error } = await supabase
                .from("checklists")
                .insert([{
                    label: itemLabel,
                    category: categoryToUse,
                    is_checked: false,
                    trip_id: selectedTripId,
                }]);

            if (error) throw error;

            // 폼 리셋
            setItemLabel("");
            // 새 카테고리를 사용한 경우, 새로 만든 카테고리로 유지
            if (selectedCategory === "new_category") {
                setSelectedCategory(categoryToUse);
                setNewCategory("");
            } else {
                // 기존 카테고리는 그대로 유지 (같은 카테고리로 여러 항목 추가 가능)
                setNewCategory("");
            }

            // onSuccess 호출하여 목록 새로고침
            onSuccess();

            // closeAfterAdd가 true일 때만 다이얼로그 닫기
            if (closeAfterAdd) {
                setOpen(false);
            }
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
                            ref={itemLabelInputRef}
                            placeholder="예: 멀티탭 챙기기"
                            value={itemLabel}
                            onChange={(e) => setItemLabel(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && itemLabel && !loading) {
                                    e.preventDefault();
                                    handleAdd(false);
                                }
                            }}
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => handleAdd(true)} 
                            disabled={loading || !itemLabel}
                            className="flex-1 sm:flex-initial"
                        >
                            추가 후 닫기
                        </Button>
                        <Button 
                            onClick={() => handleAdd(false)} 
                            disabled={loading || !itemLabel}
                            className="flex-1 sm:flex-initial"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            추가
                        </Button>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        완료
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

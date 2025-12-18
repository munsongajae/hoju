"use client";

import { useState, useEffect } from "react";
import { ChecklistGroup, ChecklistGroupData, ChecklistItemData } from "@/components/checklist/ChecklistGroup";
import { ManageChecklistDialog } from "@/components/checklist/ManageChecklistDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/contexts/TripContext";

export default function ChecklistPage() {
    const [groups, setGroups] = useState<ChecklistGroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedTripId } = useTrip();

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
                        />
                    ))}
                </div>
            )}


            <ManageChecklistDialog
                onSuccess={fetchChecklists}
                categories={groups.map(g => g.title)}
            />
        </div>
    );
}

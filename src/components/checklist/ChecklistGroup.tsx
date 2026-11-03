"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChecklistItem } from "./ChecklistItem";

export interface ChecklistItemData {
    id: string;
    label: string;
    checked: boolean;
}

export interface ChecklistGroupData {
    title: string;
    items: ChecklistItemData[];
}

interface ChecklistGroupProps {
    group: ChecklistGroupData;
    onToggle: (itemId: string, checked: boolean) => void;
    onDelete: (itemId: string) => void;
    onEdit?: (item: ChecklistItemData) => void;
    onDeleteCategory?: (category: string) => void;
}

export function ChecklistGroup({ group, onToggle, onDelete, onEdit, onDeleteCategory }: ChecklistGroupProps) {
    const checkedCount = group.items.filter(i => i.checked).length;

    return (
        <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-primary">
                    {group.title}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {checkedCount}/{group.items.length}
                    </span>
                </h3>
                {onDeleteCategory && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteCategory(group.title)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        카테고리 삭제
                    </Button>
                )}
            </div>
            <div className="bg-card rounded-lg border p-4 shadow-sm">
                {group.items.map((item) => (
                    <ChecklistItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        checked={item.checked}
                        onCheckedChange={(c) => onToggle(item.id, c)}
                        onDelete={() => onDelete(item.id)}
                        onEdit={onEdit ? () => onEdit(item) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

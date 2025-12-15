"use client";

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
}

export function ChecklistGroup({ group, onToggle }: ChecklistGroupProps) {
    return (
        <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-lg text-primary">{group.title}</h3>
            <div className="bg-card rounded-lg border p-4 shadow-sm">
                {group.items.map((item) => (
                    <ChecklistItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        checked={item.checked}
                        onCheckedChange={(c) => onToggle(item.id, c)}
                    />
                ))}
            </div>
        </div>
    );
}

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Trash2, Edit2 } from "lucide-react";

interface ChecklistItemProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

export function ChecklistItem({ id, label, checked, onCheckedChange, onDelete, onEdit }: ChecklistItemProps) {
    return (
        <div className="flex items-center justify-between group py-2">
            <div className="flex items-center space-x-2 flex-1">
                <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(c) => onCheckedChange(c as boolean)}
                />
                <Label
                    htmlFor={id}
                    className={`text-sm font-medium leading-none cursor-pointer flex-1 ${checked ? 'line-through text-muted-foreground' : ''}`}
                >
                    {label}
                </Label>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-zinc-400 hover:text-blue-500 p-1"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="text-zinc-400 hover:text-red-500 p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

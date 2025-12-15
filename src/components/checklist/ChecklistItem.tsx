"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChecklistItemProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function ChecklistItem({ id, label, checked, onCheckedChange }: ChecklistItemProps) {
    return (
        <div className="flex items-center space-x-2 py-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(c) => onCheckedChange(c as boolean)}
            />
            <Label
                htmlFor={id}
                className={`text-sm font-medium leading-none cursor-pointer ${checked ? 'line-through text-muted-foreground' : ''}`}
            >
                {label}
            </Label>
        </div>
    );
}

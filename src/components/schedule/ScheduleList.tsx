"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Coffee, Map, Plane, BedDouble, Baby, ShoppingBag, Check, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";

export type ScheduleType = "view" | "food" | "move" | "rest" | "shop" | "kids";

export interface ScheduleItemData {
    id: string;
    day: number;
    city: string;
    time: string;
    rawTime?: string; // HH:MM:SS format for comparison
    title: string;
    type: ScheduleType;
    memo?: string;
    isCompleted?: boolean;
    place_id?: string | null;
    place?: {
        id: string;
        name: string;
        category?: string;
    } | null;
}

interface ScheduleListProps {
    items: ScheduleItemData[];
    tripStartDate?: Date | null;
    onItemClick?: (item: ScheduleItemData) => void;
    onToggleComplete?: (item: ScheduleItemData) => void;
}

const typeConfig = {
    view: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Map },
    food: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: Coffee },
    move: { color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: Plane },
    rest: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: BedDouble },
    shop: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: ShoppingBag },
    kids: { color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300", icon: Baby },
};

export function ScheduleList({ items, tripStartDate, onItemClick, onToggleComplete }: ScheduleListProps) {
    // Helper to get actual date for a day number
    const getDateForDay = (dayNum: number) => {
        if (!tripStartDate) return null;
        return addDays(tripStartDate, dayNum - 1);
    };
    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                선택한 일정/지역에 해당하는 항목이 없습니다.
            </div>
        );
    }

    // Group items by Day if showing multiple days
    // But for now, let's just show a simple list, assuming the parent might handle grouping or we just show a mixed list.
    // Actually, grouping by Day is essential if "All" is selected.

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, ScheduleItemData[]>);

    const sortedDays = Object.keys(groupedItems).map(Number).sort((a, b) => a - b);

    return (
        <div className="space-y-8">
            {sortedDays.map((day) => (
                <div key={day} className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">Day {day}</span>
                        {tripStartDate && (
                            <span className="text-primary text-sm font-semibold">
                                {format(getDateForDay(day)!, "M/d (EEE)", { locale: ko })}
                            </span>
                        )}
                        <span className="text-muted-foreground text-sm font-normal">· {groupedItems[day][0].city}</span>
                    </h3>

                    <div className="relative border-l border-border ml-3 space-y-6 pb-2">
                        {groupedItems[day].map((item) => {
                            const Config = typeConfig[item.type] || typeConfig.view;
                            const Icon = Config.icon;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "ml-8 relative py-2 pr-2 flex items-start gap-3",
                                        onItemClick && "cursor-pointer hover:bg-muted/50 rounded-lg transition-colors",
                                        item.isCompleted && "opacity-50"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute -left-[45px] top-2 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                                        item.isCompleted ? "bg-green-500 text-white" : Config.color
                                    )}>
                                        {item.isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                                    </span>

                                    {onToggleComplete && (
                                        <Checkbox
                                            checked={item.isCompleted || false}
                                            onCheckedChange={() => onToggleComplete(item)}
                                            className="mt-1"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}

                                    <div
                                        className="flex-1"
                                        onClick={() => onItemClick?.(item)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <h4 className={cn(
                                                "text-base font-medium",
                                                item.isCompleted && "line-through"
                                            )}>{item.title}</h4>
                                            <time className="text-xs text-muted-foreground font-mono">{item.time}</time>
                                        </div>

                                        {item.place && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {item.place.name}
                                                </span>
                                            </div>
                                        )}
                                        {item.memo && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {item.memo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

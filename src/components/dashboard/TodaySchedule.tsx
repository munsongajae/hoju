"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScheduleItem {
    id: string;
    time: string;
    title: string;
    type: "view" | "food" | "move" | "rest" | "shop";
    completed?: boolean;
}

interface TodayScheduleProps {
    items: ScheduleItem[];
}

const typeColors = {
    view: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    move: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    rest: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export function TodaySchedule({ items }: TodayScheduleProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">오늘 일정</h2>
                <Badge variant="outline" className="font-normal">
                    {items.length}개 활동
                </Badge>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative flex gap-x-4 rounded-xl border bg-card p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                        <div
                            className={cn(
                                "absolute -bottom-6 left-6 top-10 w-px bg-border group-last:hidden",
                            )}
                        />

                        <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full border bg-background text-xs font-bold text-muted-foreground shadow-sm">
                            {index + 1}
                        </div>

                        <div className="flex-auto py-0.5">
                            <div className="flex items-center justify-between gap-x-3">
                                <span className="text-sm font-semibold leading-6 text-foreground">
                                    {item.title}
                                </span>
                                <time className="flex-none text-xs text-muted-foreground">
                                    {item.time}
                                </time>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="secondary" className={cn("text-[10px] font-medium border-0", typeColors[item.type])}>
                                    {item.type.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">오늘 예정된 일정이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

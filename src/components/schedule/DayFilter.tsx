"use client";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface DayFilterProps {
    days: number;
    selectedDay: number | "all";
    onSelectDay: (day: number | "all") => void;
}

export function DayFilter({ days, selectedDay, onSelectDay }: DayFilterProps) {
    const dayArray = Array.from({ length: days }, (_, i) => i + 1);

    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background">
            <div className="flex w-max space-x-2 p-2">
                <Button
                    variant={selectedDay === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectDay("all")}
                    className="rounded-full"
                >
                    전체
                </Button>
                {dayArray.map((day) => (
                    <Button
                        key={day}
                        variant={selectedDay === day ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectDay(day)}
                        className="rounded-full"
                    >
                        Day {day}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin, CalendarDays } from "lucide-react";

interface StatusCardProps {
    currentDate: Date;
    startDate: Date;
    totalDays: number;
    currentCity: string;
}

export function StatusCard({
    currentDate,
    startDate,
    totalDays,
    currentCity,
}: StatusCardProps) {
    // Simple day calculation
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return (
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            현재 여행지
                        </p>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <MapPin className="w-6 h-6" />
                            {currentCity}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            여행 진행률
                        </p>
                        <div className="flex items-center gap-2 text-2xl font-bold justify-end">
                            <CalendarDays className="w-6 h-6" />
                            <span>Day {dayNumber}</span>
                            <span className="text-base font-normal opacity-70">/ {totalDays}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-primary-foreground/20 flex justify-between items-center text-sm">
                    <span>{format(currentDate, "MMMM d (EEEE)")}</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">
                        가족 4인
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

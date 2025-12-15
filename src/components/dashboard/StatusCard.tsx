"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin, CalendarDays } from "lucide-react";

interface StatusCardProps {
    currentDate: Date;
    startDate: Date;
    totalDays: number;
    currentCity: string;
    familyCount?: number;
}

export function StatusCard({
    currentDate,
    startDate,
    totalDays,
    currentCity,
    familyCount = 4,
}: StatusCardProps) {
    // 여행 시작 전/중/후 계산
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const tripStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const diffTime = today.getTime() - tripStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const isTripStarted = diffDays >= 0;
    const dayNumber = isTripStarted ? diffDays + 1 : Math.abs(diffDays);

    return (
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            {isTripStarted ? "현재 여행지" : "여행 준비 중"}
                        </p>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <MapPin className="w-6 h-6" />
                            {currentCity}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            {isTripStarted ? "여행 진행률" : "출발까지"}
                        </p>
                        <div className="flex items-center gap-2 text-2xl font-bold justify-end">
                            <CalendarDays className="w-6 h-6" />
                            {isTripStarted ? (
                                <>
                                    <span>Day {dayNumber}</span>
                                    <span className="text-base font-normal opacity-70">/ {totalDays}</span>
                                </>
                            ) : (
                                <span>D-{dayNumber}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-primary-foreground/20 flex justify-between items-center text-sm">
                    <span>{format(currentDate, "MMMM d (EEEE)")}</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">
                        가족 {familyCount}인
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

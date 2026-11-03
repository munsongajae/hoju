"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTripRelativeDayNumber, clampDayNumber } from "@/lib/tripDay";

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
    const { t } = useTranslation();

    // 여행 시작 전/중/후 계산 (캘린더 날짜 기준, 타임존/DST 안전)
    const relativeDayNumber = getTripRelativeDayNumber(currentDate, startDate); // start => 1, day before => 0
    const isTripStarted = relativeDayNumber >= 1;
    const dayNumber = isTripStarted
        ? clampDayNumber(relativeDayNumber, totalDays)
        : Math.abs(relativeDayNumber - 1); // 0 => D-1, -1 => D-2 ...

    return (
        <Card className="bg-primary text-primary-foreground border-none shadow-lg pt-2 pb-0">
            <CardContent className="px-6 py-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            {isTripStarted ? t("dashboard.status.currentDestination") : t("dashboard.status.preparingTrip")}
                        </p>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <MapPin className="w-6 h-6" />
                            {currentCity}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                            {isTripStarted ? t("dashboard.status.progress") : t("dashboard.status.untilDeparture")}
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

                <div className="mt-2 pt-2 border-t border-primary-foreground/20 text-sm">
                    <span>{format(currentDate, "MMMM d (EEEE)")}</span>
                </div>
            </CardContent>
        </Card>
    );
}

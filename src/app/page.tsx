"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExchangeRateWidget } from "@/components/dashboard/ExchangeRateWidget";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { useTrip } from "@/contexts/TripContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { parseIsoToLocalDate } from "@/lib/localDate";
import { clampDayNumber, getTripRelativeDayNumber, getTripTotalDays } from "@/lib/tripDay";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: "view" | "food" | "move" | "rest" | "shop" | "kids";
  memo?: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);
  const { selectedTrip, selectedTripId, loading: tripLoading } = useTrip();
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedTrip && selectedTripId) {
      loadDashboardData();
    } else if (!tripLoading) {
      setLoading(false);
    }
  }, [selectedTrip, selectedTripId, tripLoading]);

  async function loadDashboardData() {
    if (!selectedTrip || !selectedTripId) return;

    try {
      setLoading(true);

      // 현재 날짜 기준 여행 몇일차인지 계산
      const today = new Date();
      const startDate = parseIsoToLocalDate(selectedTrip.start_date);
      const endDate = parseIsoToLocalDate(selectedTrip.end_date);
      const totalDays = getTripTotalDays(startDate, endDate);
      const rawDayNum = getTripRelativeDayNumber(today, startDate);
      const clampedDayNum = clampDayNumber(rawDayNum, totalDays);
      setCurrentDayNumber(clampedDayNum);

      // 오늘 일정 로드 (현재 여행 일차 기준)
      const scheduleData = await db.schedules
        .where("trip_id")
        .equals(selectedTripId)
        .filter(s => s.day_number === clampedDayNum)
        .toArray();

      scheduleData.sort((a,b) => {
          if (!a.start_time) return 1;
          if (!b.start_time) return -1;
          return a.start_time.localeCompare(b.start_time);
      });

      if (scheduleData && scheduleData.length > 0) {
        // 장소 데이터 가져오기 (매핑)
        const placeIds = scheduleData.map(s => s.place_id).filter(id => id);
        const places = await db.places.where('id').anyOf(placeIds as string[]).toArray();
        const placeMap = places.reduce((acc, place) => {
            acc[place.id] = { id: place.id, name: place.name };
            return acc;
        }, {} as Record<string, {id: string, name: string}>);

        const formattedSchedule: ScheduleItem[] = scheduleData.map((item: any) => ({
          id: item.id,
          time: item.start_time ? format(new Date(`2000-01-01T${item.start_time}`), "hh:mm a") : "",
          title: item.title,
          type: item.type,
          memo: item.memo,
          place_id: item.place_id,
          place: item.place_id && placeMap[item.place_id] ? placeMap[item.place_id] : null,
        }));
        setTodaySchedule(formattedSchedule);
      } else {
        setTodaySchedule([]);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || tripLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 여행이 없을 때 안내 메시지
  if (!selectedTrip) {
    return (
      <div className="p-4 pb-48 space-y-6">
        <DashboardHeader />

        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-xl font-bold">{t("dashboard.empty.title")}</h2>
          <p className="text-muted-foreground max-w-sm">
            {t("dashboard.empty.description")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings">{t("dashboard.empty.cta")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 여행 설정이 없으면 기본값 사용
  const startDate = selectedTrip.start_date ? parseIsoToLocalDate(selectedTrip.start_date) : new Date();
  const endDate = selectedTrip.end_date ? parseIsoToLocalDate(selectedTrip.end_date) : new Date();
  const totalDays = getTripTotalDays(startDate, endDate);
  const today = new Date();
  const isTripEnded = today > endDate;
  const daysSinceTripEnded = isTripEnded ? Math.max(0, getTripRelativeDayNumber(today, endDate) - 1) : 0;
  const currentCity = selectedTrip.cities?.split(",")[0]?.trim() || t("common.city.sydney");
  const familyCount = selectedTrip.family_count || 4;

  return (
    <div className="p-4 pb-48 space-y-6">
      <DashboardHeader title={selectedTrip.title} />

      <StatusCard
        currentDate={new Date()}
        startDate={startDate}
        totalDays={totalDays > 0 ? totalDays : 30}
        currentCity={currentCity}
        familyCount={familyCount}
      />

      <ExchangeRateWidget />
      <TodaySchedule
        items={todaySchedule}
        dayNumber={currentDayNumber}
        currentCity={currentCity}
        isTripEnded={isTripEnded}
        daysSinceTripEnded={daysSinceTripEnded}
      />

      <QuickLinks />
    </div>
  );
}

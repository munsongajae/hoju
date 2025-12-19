"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { differenceInDays, parseISO, format } from "date-fns";
import { useTrip } from "@/contexts/TripContext";
import { Button } from "@/components/ui/button";

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
      const startDate = parseISO(selectedTrip.start_date);
      const dayNum = differenceInDays(today, startDate) + 1;
      setCurrentDayNumber(dayNum > 0 ? dayNum : 1);

      // 오늘 일정 로드 (현재 여행 일차 기준)
      const { data: scheduleData } = await supabase
        .from("schedules")
        .select("*")
        .eq("trip_id", selectedTripId)
        .eq("day_number", dayNum > 0 ? dayNum : 1)
        .order("start_time", { ascending: true });

      if (scheduleData) {
        const formattedSchedule: ScheduleItem[] = scheduleData.map((item: any) => ({
          id: item.id,
          time: item.start_time ? format(parseISO(`2000-01-01T${item.start_time}`), "hh:mm a") : "",
          title: item.title,
          type: item.type,
          memo: item.memo,
        }));
        setTodaySchedule(formattedSchedule);
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
      <div className="p-4 space-y-6">
        <DashboardHeader />

        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-xl font-bold">여행을 시작해보세요</h2>
          <p className="text-muted-foreground max-w-sm">
            설정 페이지에서 여행 정보를 추가하면 대시보드가 활성화됩니다.
          </p>
          <Button asChild className="mt-4">
            <Link href="/settings">설정 페이지로 이동</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 여행 설정이 없으면 기본값 사용
  const startDate = selectedTrip.start_date ? parseISO(selectedTrip.start_date) : new Date();
  const endDate = selectedTrip.end_date ? parseISO(selectedTrip.end_date) : new Date();
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const currentCity = selectedTrip.cities?.split(",")[0]?.trim() || "시드니";
  const familyCount = selectedTrip.family_count || 4;

  return (
    <div className="p-4 space-y-6">
      <DashboardHeader title={selectedTrip.title} />

      <StatusCard
        currentDate={new Date()}
        startDate={startDate}
        totalDays={totalDays > 0 ? totalDays : 30}
        currentCity={currentCity}
        familyCount={familyCount}
      />

      <TodaySchedule items={todaySchedule} dayNumber={currentDayNumber} currentCity={currentCity} />

      <QuickLinks />
    </div>
  );
}

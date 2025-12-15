"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { TravelInfoSection } from "@/components/dashboard/TravelInfoSection";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { differenceInDays, parseISO, format } from "date-fns";

interface TripSettings {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  family_count: number;
  cities: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: "view" | "food" | "move" | "rest" | "shop" | "kids";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tripSettings, setTripSettings] = useState<TripSettings | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. 여행 설정 로드
        const { data: tripData } = await supabase
          .from("trips")
          .select("*")
          .limit(1)
          .single();

        if (tripData) {
          setTripSettings(tripData);

          // 현재 날짜 기준 여행 몇일차인지 계산
          const today = new Date();
          const startDate = parseISO(tripData.start_date);
          const dayNum = differenceInDays(today, startDate) + 1;
          setCurrentDayNumber(dayNum > 0 ? dayNum : 1);

          // 2. 오늘 일정 로드 (현재 여행 일차 기준)
          const { data: scheduleData } = await supabase
            .from("schedules")
            .select("*")
            .eq("trip_id", tripData.id)
            .eq("day_number", dayNum > 0 ? dayNum : 1)
            .order("start_time", { ascending: true });

          if (scheduleData) {
            const formattedSchedule: ScheduleItem[] = scheduleData.map((item: any) => ({
              id: item.id,
              time: item.start_time ? format(parseISO(`2000-01-01T${item.start_time}`), "hh:mm a") : "",
              title: item.title,
              type: item.type,
            }));
            setTodaySchedule(formattedSchedule);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 여행 설정이 없으면 기본값 사용
  const startDate = tripSettings?.start_date ? parseISO(tripSettings.start_date) : new Date();
  const endDate = tripSettings?.end_date ? parseISO(tripSettings.end_date) : new Date();
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const currentCity = tripSettings?.cities?.split(",")[0]?.trim() || "시드니";
  const familyCount = tripSettings?.family_count || 4;

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-black tracking-tighter text-foreground">FamilyTrip<span className="text-primary">.OS</span></h1>
        <ThemeToggle />
      </header>

      <StatusCard
        currentDate={new Date()}
        startDate={startDate}
        totalDays={totalDays > 0 ? totalDays : 30}
        currentCity={currentCity}
        familyCount={familyCount}
      />

      <TodaySchedule items={todaySchedule} dayNumber={currentDayNumber} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/checklist" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
          <span className="block text-2xl mb-1">✅</span>
          <span className="text-sm font-medium">체크리스트</span>
        </Link>
        <Link href="/diary" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
          <span className="block text-2xl mb-1">📔</span>
          <span className="text-sm font-medium">오늘 일기</span>
        </Link>
      </div>

      <TravelInfoSection />
    </div>
  );
}

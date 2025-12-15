import { StatusCard } from "@/components/dashboard/StatusCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import Link from "next/link";

// Mock Data
const MOCK_START_DATE = new Date("2025-10-01");
const MOCK_CURRENT_DATE = new Date("2025-10-12"); // Simulating Day 12
const MOCK_SCHEDULE = [
  { id: "1", time: "09:00 AM", title: "타롱가 동물원", type: "view" as const },
  { id: "2", time: "12:30 PM", title: "점심 식사 (The View)", type: "food" as const },
  { id: "3", time: "02:00 PM", title: "페리 타고 서큘러 키로 이동", type: "move" as const },
  { id: "4", time: "03:00 PM", title: "오페라 하우스 투어", type: "view" as const },
  { id: "5", time: "06:00 PM", title: "저녁 식사 (서큘러 키)", type: "food" as const },
];

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-black tracking-tighter text-foreground">FamilyTrip<span className="text-primary">.OS</span></h1>
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </header>

      <StatusCard
        currentDate={MOCK_CURRENT_DATE}
        startDate={MOCK_START_DATE}
        totalDays={30}
        currentCity="시드니"
      />

      <TodaySchedule items={MOCK_SCHEDULE} />

      {/* Quick Actions (Future) */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/checklist" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
          <span className="block text-2xl mb-1">✅</span>
          <span className="text-sm font-medium">체크리스트</span>
        </Link>
        <Link href="/expenses" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
          <span className="block text-2xl mb-1">💰</span>
          <span className="text-sm font-medium">지출 기록</span>
        </Link>
      </div>
    </div>
  );
}

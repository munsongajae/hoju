"use client";

import { useState, useEffect, useMemo } from "react";
import { CityFilter } from "@/components/schedule/CityFilter";
import { DayFilter } from "@/components/schedule/DayFilter";
import { ScheduleList, ScheduleItemData, ScheduleType } from "@/components/schedule/ScheduleList";
import { AddScheduleDialog } from "@/components/schedule/AddScheduleDialog";
import { EditScheduleDialog } from "@/components/schedule/EditScheduleDialog";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { addDays, isAfter, parse, set } from "date-fns";

// Helper to format HH:MM:SS to HH:MM AM/PM
const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10); // Handle potential seconds
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes.padStart(2, '0')} ${ampm}`;
};

const CITIES = ["전체", "시드니", "멜버른"];

export default function SchedulePage() {
    const [items, setItems] = useState<ScheduleItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);

    const [selectedCity, setSelectedCity] = useState("전체");
    const [selectedDay, setSelectedDay] = useState<number | "all">("all");

    // Edit Dialog State
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItemData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchSchedules();
        fetchTripInfo();
    }, []);

    // Auto-complete past schedule items
    useEffect(() => {
        if (!tripStartDate || items.length === 0) return;

        const now = new Date();
        const itemsToComplete: ScheduleItemData[] = [];

        items.forEach(item => {
            if (item.isCompleted) return; // Skip already completed
            if (!item.rawTime) return;

            // Calculate actual date/time for this schedule item
            const itemDate = addDays(tripStartDate, item.day - 1);
            const [hours, minutes] = item.rawTime.split(':').map(Number);
            const itemDateTime = set(itemDate, { hours, minutes, seconds: 0 });

            // If current time is after the scheduled time, mark as complete
            if (isAfter(now, itemDateTime)) {
                itemsToComplete.push(item);
            }
        });

        // Auto-complete past items
        if (itemsToComplete.length > 0) {
            itemsToComplete.forEach(async (item) => {
                // Optimistic update
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, isCompleted: true } : i
                ));

                // Update in database
                await supabase
                    .from('schedules')
                    .update({ is_completed: true })
                    .eq('id', item.id);
            });
        }
    }, [items, tripStartDate]);

    async function fetchTripInfo() {
        const { data } = await supabase
            .from('trips')
            .select('start_date')
            .limit(1)
            .single();

        if (data) {
            setTripStartDate(new Date(data.start_date));
        }
    }

    async function fetchSchedules() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .order('day_number', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) {
                console.error('Error fetching schedules:', error);
            } else if (data) {
                const formattedData: ScheduleItemData[] = data.map((item: any) => ({
                    id: item.id,
                    day: item.day_number,
                    city: item.city,
                    time: formatTime(item.start_time),
                    rawTime: item.start_time,
                    title: item.title,
                    type: item.type as ScheduleType,
                    memo: item.memo,
                    isCompleted: item.is_completed || false,
                }));
                setItems(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const cityMatch = selectedCity === "전체" || item.city === selectedCity;
            const dayMatch = selectedDay === "all" || item.day === selectedDay;
            return cityMatch && dayMatch;
        });
    }, [items, selectedCity, selectedDay]);

    async function handleToggleComplete(item: ScheduleItemData) {
        const newValue = !item.isCompleted;

        // Optimistic update
        setItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isCompleted: newValue } : i
        ));

        try {
            const { error } = await supabase
                .from('schedules')
                .update({ is_completed: newValue })
                .eq('id', item.id);

            if (error) {
                console.error('Error updating completion:', error);
                // Revert on error
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, isCompleted: !newValue } : i
                ));
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-background">
            <div className="flex-none p-4 space-y-4 bg-background z-10 sticky top-0 border-b">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">여행 일정</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-1">{filteredItems.length}개</span>
                        <AddScheduleDialog onScheduleAdded={fetchSchedules} />
                    </div>
                </div>

                <CityFilter
                    cities={CITIES}
                    selectedCity={selectedCity}
                    onSelectCity={(city) => {
                        setSelectedCity(city);
                        setSelectedDay("all");
                    }}
                />

                <DayFilter
                    days={30}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ScheduleList
                        items={filteredItems}
                        tripStartDate={tripStartDate}
                        onItemClick={(item) => {
                            setEditingSchedule(item);
                            setEditDialogOpen(true);
                        }}
                        onToggleComplete={handleToggleComplete}
                    />
                )}
            </div>

            <EditScheduleDialog
                schedule={editingSchedule}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onScheduleUpdated={fetchSchedules}
            />
        </div>
    );
}

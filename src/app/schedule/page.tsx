"use client";

import { useState, useEffect, useMemo } from "react";
import { CityChipFilter } from "@/components/schedule/CityChipFilter";
import { ScheduleList, ScheduleItemData, ScheduleType } from "@/components/schedule/ScheduleList";
import { AddScheduleDialog } from "@/components/schedule/AddScheduleDialog";
import { EditScheduleDialog } from "@/components/schedule/EditScheduleDialog";
import { db } from "@/lib/db";
import { Loader2, Search, ArrowUpDown, Clock, MapPin, AlignLeft, Plus, Star, Baby, ExternalLink, Phone, Globe, Download, Trash2 } from "lucide-react";
import { useTrip } from "@/contexts/TripContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { ExpenseCategory, ExpenseData } from "@/components/expenses/ExpenseList";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { addDays, format, isAfter, set } from "date-fns";
import { PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShareButton } from "@/components/ui/share-button";
import { formatScheduleText } from "@/lib/shareUtils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { AIScheduleGenerator } from "@/components/schedule/AIScheduleGenerator";
import { Sparkles } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "react-i18next";
import { parseIsoToLocalDate, parseStoredDateToLocal, todayLocalDateYYYYMMDD } from "@/lib/localDate";

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

// CITIES 상수는 동적으로 계산됩니다.
const mapToExpenseCategory = (type: ScheduleType): ExpenseCategory => {
    switch (type) {
        case 'food': return 'food';
        case 'move': return 'transport';
        case 'shop': return 'shopping';
        case 'view':
        case 'kids': return 'activity';
        default: return 'etc';
    }
};

export default function SchedulePage() {
    const [items, setItems] = useState<ScheduleItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
    const { selectedTripId, selectedTrip } = useTrip();
    const toast = useToast();
    const { t } = useTranslation();
    const allCityLabel = t("schedule.filter.all");

    const parsedCities = useMemo(() => {
        return selectedTrip?.cities
            ? selectedTrip.cities.split(",").map((c) => c.trim()).filter(Boolean)
            : [];
    }, [selectedTrip?.cities]);

    const [selectedCity, setSelectedCity] = useState<string | "all">("all");
    const [sortBy, setSortBy] = useState<"time" | "city">("time");
    /** 완료·미완료 다중 칩 필터 (기본: 둘 다 켜짐 = 전체 표시, 둘 다 끄면 필터 없음 = 전체 표시) */
    const [showIncompleteItems, setShowIncompleteItems] = useState(true);
    const [showCompletedItems, setShowCompletedItems] = useState(true);
    const [autoComplete, setAutoComplete] = useState(false);
    const [compactMode, setCompactMode] = useState(true);

    // Add Schedule Dialog State
    const [addScheduleDialogOpen, setAddScheduleDialogOpen] = useState(false);
    const [initialDayForAdd, setInitialDayForAdd] = useState<number | null>(null);
    // Edit Dialog State
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItemData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    // Detail Dialog State
    const [detailSchedule, setDetailSchedule] = useState<ScheduleItemData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // 연동된 지출 State
    const [linkedExpenses, setLinkedExpenses] = useState<ExpenseData[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);
    const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);

    // 연동된 장소 State
    const [linkedPlace, setLinkedPlace] = useState<PlaceData | null>(null);
    const [loadingPlace, setLoadingPlace] = useState(false);
    const [placeDetailDialogOpen, setPlaceDetailDialogOpen] = useState(false);

    // AI Generator State
    const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

    useEffect(() => {
        if (parsedCities.length === 0) {
            setSelectedCity("all");
            return;
        }
        if (selectedCity === "all") return;
        if (!parsedCities.includes(selectedCity)) setSelectedCity("all");
    }, [parsedCities, selectedCity]);

    // 상세 모달 열릴 때 지출 및 장소 정보 가져오기
    useEffect(() => {
        if (detailSchedule && detailDialogOpen) {
            fetchLinkedExpenses(detailSchedule.id);
            if (detailSchedule.place_id) {
                fetchLinkedPlace(detailSchedule.place_id);
            } else {
                setLinkedPlace(null);
            }
        } else {
            setLinkedExpenses([]);
            setLinkedPlace(null);
        }
    }, [detailSchedule, detailDialogOpen]);
    const fetchLinkedExpenses = async (scheduleId: string) => {
        setLoadingExpenses(true);
        try {
            const data = await db.expenses
                .where("schedule_id")
                .equals(scheduleId)
                .toArray();

            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (data) {
                const formattedData: ExpenseData[] = data.map((item: any) => ({
                    id: item.id,
                    date: parseStoredDateToLocal(item.date),
                    amount: item.amount,
                    category: item.category as ExpenseCategory,
                    title: item.title,
                    city: item.city,
                    currency: item.currency,
                }));
                setLinkedExpenses(formattedData);
            }
        } catch (err) {
            console.error("Failed to fetch linked expenses:", err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    const fetchLinkedPlace = async (placeId: string) => {
        setLoadingPlace(true);
        try {
            const data = await db.places.get(placeId);

            if (data) {
                const formattedPlace: PlaceData = {
                    id: data.id,
                    name: data.name,
                    category: data.category as PlaceCategory,
                    city: data.city || (parsedCities[0] || ""),
                    rating: data.rating,
                    isKidFriendly: data.is_kid_friendly || false,
                    notes: data.notes || "",
                    googleMapUrl: data.google_map_url,
                    isFavorite: data.is_favorite || false,
                    operatingHours: data.operating_hours,
                    contactPhone: data.contact_phone,
                    websiteUrl: data.website_url,
                    address: data.address,
                    visitCount: data.visit_count || 0,
                };
                setLinkedPlace(formattedPlace);
            }
        } catch (err) {
            console.error("Failed to fetch linked place:", err);
        } finally {
            setLoadingPlace(false);
        }
    };

    const categoryColors: Record<PlaceCategory, string> = {
        tour: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        shop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        medical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        play: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        museum: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        market: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    };

    const categoryLabels: Record<PlaceCategory, string> = {
        tour: t("dashboard.place.tour"),
        food: t("dashboard.place.food"),
        shop: t("dashboard.place.shop"),
        medical: t("dashboard.place.medical"),
        play: t("dashboard.place.play"),
        museum: t("dashboard.place.museum"),
        market: t("dashboard.place.market"),
    };

    useEffect(() => {
        if (!selectedTripId) {
            setItems([]);
            setTripStartDate(null);
            setLoading(false);
            return;
        }

        fetchSchedules();
        fetchTripInfo();
    }, [selectedTripId, selectedTrip]);

    // Auto-complete past schedule items (only when autoComplete is enabled)
    useEffect(() => {
        if (!autoComplete || !tripStartDate || items.length === 0) return;

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
                await db.schedules.update(item.id, { is_completed: true });
            });
        }
    }, [autoComplete, items, tripStartDate]);


    async function fetchTripInfo() {
        if (selectedTrip && selectedTrip.start_date) {
            setTripStartDate(parseIsoToLocalDate(selectedTrip.start_date));
        }
    }

    async function fetchSchedules() {
        if (!selectedTripId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const schedulesData = await db.schedules
                .where("trip_id")
                .equals(selectedTripId)
                .toArray();
            
            // Fetch places to simulate join
            const placeIds = schedulesData.map(s => s.place_id).filter(Boolean) as string[];
            const places = await db.places.where('id').anyOf(placeIds).toArray();
            const placesMap = new Map(places.map(p => [p.id, p]));

            // 정렬 우선순위: day_number → display_order → start_time → id (안정 정렬)
            schedulesData.sort((a, b) => {
                if (a.day_number !== b.day_number) return a.day_number - b.day_number;
                const orderA = a.display_order ?? 0;
                const orderB = b.display_order ?? 0;
                if (orderA !== orderB) return orderA - orderB;
                const timeA = a.start_time || "";
                const timeB = b.start_time || "";
                const timeCmp = timeA.localeCompare(timeB);
                if (timeCmp !== 0) return timeCmp;
                return (a.id || "").localeCompare(b.id || "");
            });

            const formattedData: ScheduleItemData[] = schedulesData.map((item) => {
                const place = item.place_id ? placesMap.get(item.place_id) : null;
                return {
                    id: item.id,
                    day: item.day_number,
                    city: item.city || (parsedCities[0] || ""),
                    time: formatTime(item.start_time || ""),
                    rawTime: item.start_time,
                    title: item.title,
                    type: item.type as ScheduleType,
                    memo: item.memo,
                    isCompleted: item.is_completed || false,
                    place_id: item.place_id,
                    displayOrder: item.display_order ?? 0,
                    place: place ? {
                        id: place.id,
                        name: place.name,
                        category: place.category,
                    } : null,
                };
            });
            setItems(formattedData);
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = useMemo(() => {
        let filtered = items.filter((item) => {
            const cityMatch = selectedCity === "all" || item.city === selectedCity;
            const completionMatch = (() => {
                if (showIncompleteItems && showCompletedItems) return true;
                if (showIncompleteItems) return !item.isCompleted;
                if (showCompletedItems) return item.isCompleted;
                return true;
            })();
            return cityMatch && completionMatch;
        });

        // 정렬 적용
        filtered = [...filtered].sort((a, b) => {
            // 같은 day 내에서는 display_order를 우선적으로 사용
            if (a.day === b.day) {
                const orderA = a.displayOrder ?? 0;
                const orderB = b.displayOrder ?? 0;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // display_order가 같으면 시간순으로 정렬
                if (a.rawTime && b.rawTime) {
                    const cmp = a.rawTime.localeCompare(b.rawTime);
                    if (cmp !== 0) return cmp;
                }
                // 동순위면 id로 안정 정렬 (드래그 후 동일 표시 순서 유지)
                return (a.id || "").localeCompare(b.id || "");
            }

            // 다른 day 간의 정렬은 기존 로직 사용
            switch (sortBy) {
                case "time":
                    // Day가 다르면 day 순서로 먼저 정렬
                    if (a.day !== b.day) {
                        return a.day - b.day;
                    }
                    if (!a.rawTime || !b.rawTime) return 0;
                    return a.rawTime.localeCompare(b.rawTime);
                case "city":
                    return a.city.localeCompare(b.city, "ko");
                default:
                    // 기본적으로 day 순서로 정렬
                    return a.day - b.day;
            }
        });

        return filtered;
    }, [items, selectedCity, sortBy, showIncompleteItems, showCompletedItems]);

    async function handleToggleComplete(item: ScheduleItemData) {
        const newValue = !item.isCompleted;

        // Optimistic update
        setItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isCompleted: newValue } : i
        ));

        try {
            await db.schedules.update(item.id, { is_completed: newValue });
        } catch (err) {
            console.error('Error updating completion:', err);
            // Revert on error
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, isCompleted: !newValue } : i
            ));
        }
    }

    function handleAddSchedule(day: number) {
        setInitialDayForAdd(day);
        setAddScheduleDialogOpen(true);
    }

    async function handleOrderChange(updates: Array<{ id: string; day: number; displayOrder: number }>) {
        // 새로 이동한 day로부터 trip 기준 date(YYYY-MM-DD)도 함께 계산해서 DB에 반영해야
        // day_number와 date의 정합성이 유지된다. (date가 어긋나면 보고서/일기 매핑이 깨짐)
        const updatesWithDate = updates.map((update) => {
            let newDate: string | null = null;
            if (tripStartDate) {
                const calculatedDate = addDays(tripStartDate, update.day - 1);
                newDate = format(calculatedDate, 'yyyy-MM-dd');
            }
            return { ...update, date: newDate };
        });

        // Optimistic update
        setItems(prev => {
            const updatedMap = new Map(updates.map(u => [u.id, u]));
            return prev.map(item => {
                const update = updatedMap.get(item.id);
                if (update) {
                    return {
                        ...item,
                        day: update.day,
                        displayOrder: update.displayOrder,
                    };
                }
                return item;
            });
        });

        try {
            await db.transaction('rw', db.schedules, async () => {
                await Promise.all(
                    updatesWithDate.map((update) => {
                        const patch: { display_order: number; day_number: number; date?: string } = {
                            display_order: update.displayOrder,
                            day_number: update.day,
                        };
                        if (update.date) patch.date = update.date;
                        return db.schedules.update(update.id, patch);
                    }),
                );
            });
        } catch (err) {
            console.error('Unexpected error updating order:', err);
            fetchSchedules();
        }
    }

    const handleExportCSV = async () => {
        if (filteredItems.length === 0) {
            alert(t("schedule.export.empty"));
            return;
        }

        const headers = [
            t("schedule.csv.header.day"),
            t("schedule.csv.header.city"),
            t("schedule.csv.header.category"),
            t("schedule.csv.header.time"),
            t("schedule.csv.header.completed"),
            t("schedule.csv.header.title"),
            t("schedule.csv.header.memo"),
        ];
        
        const scheduleTypeLabels: Record<ScheduleType, string> = {
            view: t("schedule.csv.type.view"),
            food: t("schedule.csv.type.food"),
            move: t("schedule.csv.type.move"),
            rest: t("schedule.csv.type.rest"),
            shop: t("schedule.csv.type.shop"),
            kids: t("schedule.csv.type.kids"),
        };

        const csvRows = [
            headers.join(","),
            ...filteredItems.map(item => {
                const day = t("schedule.dayLabel", { day: item.day });
                const city = item.city || t("common.unspecified");
                const type = scheduleTypeLabels[item.type] || item.type;
                const time = item.time || t("common.unspecified");
                const isCompleted = item.isCompleted ? "O" : "X";
                const title = `"${item.title.replace(/"/g, '""')}"`;
                const memo = `"${(item.memo || "").replace(/"/g, '""')}"`;

                return [day, city, type, time, isCompleted, title, memo].join(",");
            })
        ];

        const csvString = csvRows.join("\n");
        const csvData = "\uFEFF" + csvString;
        const fileName = `${t("schedule.csv.filePrefix")}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;

        try {
            if (Capacitor.isNativePlatform()) {
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: csvData,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8,
                });

                await Share.share({
                    title: t("schedule.export.shareTitle"),
                    text: t("schedule.export.shareText"),
                    url: result.uri,
                    dialogTitle: t("schedule.export.shareDialog"),
                });
                return;
            }

            const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("CSV 내보내기 실패:", err);
            alert(t("schedule.export.fail", { message: err?.message || t("common.unknownError") }));
        }
    };

    const handleDeleteAll = async () => {
        if (items.length === 0) return;
        if (!confirm(`일정 전체 ${items.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
        const allIds = items.map(i => i.id);
        setItems([]);
        try {
            await db.schedules.bulkDelete(allIds);
            toast.success("일정이 모두 삭제되었습니다.");
        } catch (err) {
            console.error("Failed to delete all schedules:", err);
            fetchSchedules();
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-background">
            <div className="flex-none px-4 py-2 space-y-2 bg-muted/40 z-10 sticky top-0 border-b shadow-sm">
                <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
                        <h1 className="text-xl font-bold whitespace-nowrap shrink-0">{t("schedule.title")}</h1>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
                        <span className="text-xs text-muted-foreground mr-1">{t("schedule.count", { count: filteredItems.length })}</span>
                        <ShareButton
                            title={`${selectedTrip?.title || t("common.trip")} ${t("schedule.title")}`}
                            generateText={() => formatScheduleText(
                                selectedTrip?.title || t("common.trip"),
                                filteredItems.map(item => ({
                                    day_number: item.day,
                                    start_time: item.rawTime,
                                    title: item.title,
                                    city: item.city,
                                    type: item.type,
                                    memo: item.memo,
                                    is_completed: item.isCompleted,
                                })),
                                selectedCity !== "all"
                                    ? t("schedule.share.cityFilter", { city: selectedCity })
                                    : undefined
                            )}
                        />
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExportCSV}>
                            <Download className="w-3.5 h-3.5" />
                            <span>{t("schedule.exportCsv")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-primary/50 hover:bg-primary/5"
                            onClick={() => setAiGeneratorOpen(true)}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span>{t("schedule.aiGenerate")}</span>
                        </Button>
                        {items.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                                onClick={handleDeleteAll}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>전체 초기화</span>
                            </Button>
                        )}
                        <AddScheduleDialog 
                            onScheduleAdded={fetchSchedules}
                        />
                    </div>
                </div>

                {parsedCities.length > 0 && (
                    <CityChipFilter
                        cities={parsedCities}
                        selectedCity={selectedCity}
                        allLabel={allCityLabel}
                        onSelectCity={(city) => setSelectedCity(city)}
                    />
                )}

                {/* 필터: 자동완료·간략히 왼쪽, 완료/미완료 칩은 남는 우측 공간 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="auto-complete"
                                checked={autoComplete}
                                onCheckedChange={setAutoComplete}
                            />
                            <Label htmlFor="auto-complete" className="text-xs text-muted-foreground cursor-pointer">
                                {t("schedule.filter.autoComplete")}
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="compact-mode"
                                checked={compactMode}
                                onCheckedChange={setCompactMode}
                            />
                            <Label htmlFor="compact-mode" className="text-xs text-muted-foreground cursor-pointer">
                                {t("schedule.filter.compact")}
                            </Label>
                        </div>
                    </div>
                    <div
                        className="flex items-center gap-1 shrink-0"
                        role="group"
                        aria-label={t("schedule.completion.filterGroupAria")}
                    >
                        <Button
                            type="button"
                            variant={showIncompleteItems ? "secondary" : "outline"}
                            size="sm"
                            aria-pressed={showIncompleteItems}
                            onClick={() => setShowIncompleteItems((v) => !v)}
                            className={cn(
                                "rounded-full h-7 px-2.5 text-[10px] font-medium",
                                showIncompleteItems && "bg-secondary"
                            )}
                        >
                            {t("schedule.completion.incomplete")}
                        </Button>
                        <Button
                            type="button"
                            variant={showCompletedItems ? "secondary" : "outline"}
                            size="sm"
                            aria-pressed={showCompletedItems}
                            onClick={() => setShowCompletedItems((v) => !v)}
                            className={cn(
                                "rounded-full h-7 px-2.5 text-[10px] font-medium",
                                showCompletedItems && "bg-secondary"
                            )}
                        >
                            {t("schedule.completion.completed")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ScheduleList
                        items={filteredItems}
                        tripTitle={selectedTrip?.title || t("common.trip")}
                        tripStartDate={tripStartDate}
                        onItemClick={(item) => {
                            setDetailSchedule(item);
                            setDetailDialogOpen(true);
                        }}
                        onToggleComplete={handleToggleComplete}
                        onOrderChange={handleOrderChange}
                        compactMode={compactMode}
                        onAddSchedule={handleAddSchedule}
                    />
                )}
            </div>

            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-[480px] max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{detailSchedule?.title}</DialogTitle>
                        <DialogDescription>{t("schedule.detail.description")}</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
                        {detailSchedule && (
                            <>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">{t("schedule.detail.time")}:</span>
                                    <span>{detailSchedule.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">{t("schedule.detail.city")}:</span>
                                    <span>{detailSchedule.city}</span>
                                </div>
                                {/* 연동된 장소 정보 */}
                                {detailSchedule.place && (
                                    <div className="border-t pt-4 space-y-3">
                                        <Label className="text-sm font-medium">{t("schedule.detail.linkedPlace")}</Label>
                                        {loadingPlace ? (
                                            <div className="flex justify-center py-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            </div>
                                        ) : linkedPlace ? (
                                            <div 
                                                className="p-3 bg-muted rounded-md space-y-2 cursor-pointer hover:bg-muted/80 transition-colors"
                                                onClick={() => setPlaceDetailDialogOpen(true)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="secondary" className={cn("text-xs font-medium border-0", categoryColors[linkedPlace.category])}>
                                                                {categoryLabels[linkedPlace.category]}
                                                            </Badge>
                                                            {linkedPlace.rating && (
                                                                <div className="flex items-center text-amber-500 text-xs">
                                                                    <Star className="w-3 h-3 fill-current mr-0.5" />
                                                                    {linkedPlace.rating}
                                                                </div>
                                                            )}
                                                            {linkedPlace.isKidFriendly && (
                                                                <div className="flex items-center text-pink-500 text-xs">
                                                                    <Baby className="w-3 h-3 mr-0.5" />
                                                                    {t("dashboard.today.kids")}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-base mb-1">{linkedPlace.name}</h4>
                                                        {linkedPlace.address && (
                                                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                                <span>{linkedPlace.address}</span>
                                                            </div>
                                                        )}
                                                        {linkedPlace.notes && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{linkedPlace.notes}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                                                            {linkedPlace.operatingHours && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{linkedPlace.operatingHours}</span>
                                                                </div>
                                                            )}
                                                            {linkedPlace.contactPhone && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Phone className="w-3 h-3" />
                                                                    <span>{linkedPlace.contactPhone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {linkedPlace.websiteUrl && (
                                                            <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                                <Globe className="w-3 h-3" />
                                                                <a 
                                                                    href={linkedPlace.websiteUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="hover:underline"
                                                                >
                                                                    웹사이트
                                                                </a>
                                                            </div>
                                                        )}
                                                        {linkedPlace.googleMapUrl && (
                                                            <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                                <ExternalLink className="w-3 h-3" />
                                                                <a 
                                                                    href={linkedPlace.googleMapUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="hover:underline"
                                                                >
                                                                    지도에서 보기
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                                                    클릭하여 상세 정보 보기
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-muted rounded-md">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium text-muted-foreground">장소:</span>
                                                    <span>{detailSchedule.place.name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">장소 정보를 불러올 수 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {detailSchedule.memo && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-muted-foreground">메모:</span>
                                        </div>
                                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                                            {detailSchedule.memo}
                                        </div>
                                    </div>
                                )}

                                {/* 연동된 지출 목록 */}
                                <div className="grid gap-2 border-t pt-4">
                                    <Label className="text-sm font-medium">연동된 지출</Label>
                                    {loadingExpenses ? (
                                        <div className="flex justify-center py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        </div>
                                    ) : linkedExpenses.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {linkedExpenses.map((expense) => {
                                                const isKRW = expense.currency === 'KRW';
                                                return (
                                                    <div
                                                        key={expense.id}
                                                        className="flex items-center justify-between p-2 bg-muted rounded-md text-sm cursor-pointer hover:bg-muted/80 transition-colors"
                                                        onClick={() => {
                                                            setSelectedExpense(expense);
                                                            setExpenseEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium">{expense.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {expense.category}
                                                            </p>
                                                        </div>
                                                        <div className="font-semibold">
                                                            {isKRW ? '₩' : 'A$'}{expense.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-1">
                                            연동된 지출이 없습니다.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-between gap-2 flex-shrink-0 border-t pt-4">
                        <AddExpenseDialog
                            trigger={
                                <Button variant="outline" className="gap-1">
                                    <Plus className="w-4 h-4" />
                                    비용 추가
                                </Button>
                            }
                            initialData={{
                                title: detailSchedule?.title || "",
                                date: todayLocalDateYYYYMMDD(),
                                category: detailSchedule ? mapToExpenseCategory(detailSchedule.type) : 'etc',
                                city: detailSchedule?.city || (parsedCities[0] || ""),
                                scheduleId: detailSchedule?.id,
                            }}
                            onExpenseAdded={() => {
                                alert('지출이 추가되었습니다.');
                            }}
                        />
                        <div className="flex gap-2">
                            <ShareButton
                                title={`일정 공유: ${detailSchedule?.title}`}
                                size="default"
                                variant="outline"
                                generateText={() => formatScheduleText(
                                    selectedTrip?.title || "여행",
                                    detailSchedule ? [{
                                        day_number: detailSchedule.day,
                                        start_time: detailSchedule.rawTime,
                                        title: detailSchedule.title,
                                        city: detailSchedule.city,
                                        type: detailSchedule.type,
                                        memo: detailSchedule.memo,
                                        is_completed: detailSchedule.isCompleted,
                                    }] : [],
                                    "개별 일정 상세"
                                )}
                            />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDetailDialogOpen(false);
                                    setDetailSchedule(null);
                                }}
                            >
                                닫기
                            </Button>
                            <Button
                                onClick={() => {
                                    if (detailSchedule) {
                                        setEditingSchedule(detailSchedule);
                                        setEditDialogOpen(true);
                                    }
                                    setDetailDialogOpen(false);
                                }}
                            >
                                수정하기
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <EditScheduleDialog
                schedule={editingSchedule}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onScheduleUpdated={fetchSchedules}
            />

            {/* DAY별 일정 추가 다이얼로그 */}
            {initialDayForAdd !== null && (
                <AddScheduleDialog
                    onScheduleAdded={() => {
                        fetchSchedules();
                        setAddScheduleDialogOpen(false);
                        setInitialDayForAdd(null);
                    }}
                    open={addScheduleDialogOpen}
                    onOpenChange={(open) => {
                        setAddScheduleDialogOpen(open);
                        if (!open) {
                            setInitialDayForAdd(null);
                        }
                    }}
                    initialDay={initialDayForAdd}
                />
            )}

            {/* 장소 상세보기 다이얼로그 */}
            {linkedPlace && (
                <PlaceDetailDialog
                    place={linkedPlace}
                    open={placeDetailDialogOpen}
                    onOpenChange={setPlaceDetailDialogOpen}
                    onEdit={(place) => {
                        // 장소 수정 다이얼로그는 places 페이지에서 관리
                        window.location.href = `/places`;
                    }}
                />
            )}

            {/* 지출 상세보기(수정) 다이얼로그 */}
            <EditExpenseDialog
                expense={selectedExpense}
                open={expenseEditDialogOpen}
                onOpenChange={setExpenseEditDialogOpen}
                onExpenseUpdated={() => {
                    // 지출 업데이트 후 연동된 지출 목록 다시 가져오기
                    if (detailSchedule) {
                        fetchLinkedExpenses(detailSchedule.id);
                    }
                }}
            />
            <AIScheduleGenerator
                open={aiGeneratorOpen}
                onOpenChange={setAiGeneratorOpen}
                onScheduleImported={fetchSchedules}
            />
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </div>
    );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Tag, AlignLeft, Plus, MapPin, Star, Baby, ExternalLink, Phone, Globe, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { ExpenseCategory, ExpenseData } from "@/components/expenses/ExpenseList";
import { PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseStoredDateToLocal, todayLocalDateYYYYMMDD } from "@/lib/localDate";

interface ScheduleItem {
    id: string;
    time: string;
    title: string;
    type: "view" | "food" | "move" | "rest" | "shop" | "kids";
    completed?: boolean;
    memo?: string;
    place?: {
        id: string;
        name: string;
    } | null;
    place_id?: string | null;
}

interface TodayScheduleProps {
    items: ScheduleItem[];
    dayNumber?: number;
    currentCity?: string;
    isTripEnded?: boolean;
    daysSinceTripEnded?: number;
}

const typeColors: Record<string, string> = {
    view: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    move: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    rest: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    shop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    kids: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const mapToExpenseCategory = (type: string): ExpenseCategory => {
    switch (type) {
        case 'food': return 'food';
        case 'move': return 'transport';
        case 'shop': return 'shopping';
        case 'view':
        case 'kids': return 'activity';
        default: return 'etc';
    }
};

export function TodaySchedule({ items, dayNumber, currentCity, isTripEnded = false, daysSinceTripEnded = 0 }: TodayScheduleProps) {
    const { t } = useTranslation();
    const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // 연동된 지출
    const [linkedExpenses, setLinkedExpenses] = useState<ExpenseData[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);
    const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);

    // 연동된 장소
    const [linkedPlace, setLinkedPlace] = useState<PlaceData | null>(null);
    const [loadingPlace, setLoadingPlace] = useState(false);
    const [placeDetailDialogOpen, setPlaceDetailDialogOpen] = useState(false);

    // 상세 다이얼로그 열릴 때 지출 및 장소 정보 가져오기
    useEffect(() => {
        if (selectedItem && isDialogOpen) {
            fetchLinkedExpenses(selectedItem.id);
            if (selectedItem.place_id) {
                fetchLinkedPlace(selectedItem.place_id);
            } else {
                setLinkedPlace(null);
            }
        } else {
            setLinkedExpenses([]);
            setLinkedPlace(null);
        }
    }, [selectedItem, isDialogOpen]);

    const fetchLinkedExpenses = async (scheduleId: string) => {
        setLoadingExpenses(true);
        try {
            const data = await db.expenses
                .where("schedule_id")
                .equals(scheduleId)
                .toArray();
            
            data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    city: data.city || currentCity || "",
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

    const handleItemClick = (item: ScheduleItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
                <h2 className="text-lg font-bold tracking-tight">
                    {dayNumber ? t("dashboard.today.titleWithDay", { day: String(dayNumber) }) : t("dashboard.today.titleToday")}
                </h2>
                <Badge variant="outline" className="font-normal ml-auto">
                    {t("dashboard.today.activitiesCount", { count: items.length })}
                </Badge>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative flex gap-x-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer hover:shadow-md"
                        onClick={() => handleItemClick(item)}
                    >
                        <div
                            className={cn(
                                "absolute -bottom-6 left-6 top-10 w-px bg-border group-last:hidden",
                            )}
                        />

                        <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full border bg-background text-xs font-bold text-muted-foreground shadow-sm">
                            {index + 1}
                        </div>

                        <div className="flex-auto py-0.5">
                            <div className="flex items-center justify-between gap-x-3">
                                <span className="text-sm font-semibold leading-6 text-foreground">
                                    {item.title}
                                </span>
                                <time className="flex-none text-xs text-muted-foreground">
                                    {item.time}
                                </time>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                            <CalendarCheck className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {isTripEnded
                                ? t("dashboard.today.endedDays", { days: String(daysSinceTripEnded) })
                                : t("dashboard.today.noSchedule")}
                        </p>
                        {!isTripEnded && <p className="text-xs mt-1">{t("dashboard.today.relax")}</p>}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                        <DialogDescription>{t("dashboard.today.detailDesc")}</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {selectedItem && (
                            <div className="space-y-4 mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">{t("dashboard.today.time")}</span>
                                    <span>{selectedItem.time}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">{t("dashboard.today.type")}</span>
                                    <Badge variant="secondary" className={cn("text-xs font-medium border-0", typeColors[selectedItem.type])}>
                                        {t(`dashboard.type.${selectedItem.type}`)}
                                    </Badge>
                                </div>

                                {/* 연동된 장소 정보 */}
                                {selectedItem.place && (
                                    <div className="border-t pt-4 space-y-3">
                                        <Label className="text-sm font-medium">{t("dashboard.today.linkedPlace")}</Label>
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
                                                                {t(`dashboard.place.${linkedPlace.category}`)}
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
                                                                    {t("dashboard.today.website")}
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
                                                                    {t("dashboard.today.viewOnMap")}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                                                    {t("dashboard.today.clickForDetail")}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-muted rounded-md">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium text-muted-foreground">{t("dashboard.today.place")}</span>
                                                    <span>{selectedItem.place.name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">{t("dashboard.today.placeNotFound")}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">{t("dashboard.today.memo")}</span>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                                        {selectedItem.memo || t("dashboard.today.noMemo")}
                                    </div>
                                </div>

                                {/* 연동된 지출 목록 */}
                                <div className="grid gap-2 border-t pt-4">
                                    <Label className="text-sm font-medium">{t("dashboard.today.linkedExpenses")}</Label>
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
                                            {t("dashboard.today.noLinkedExpenses")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <AddExpenseDialog
                                        trigger={
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <Plus className="w-3.5 h-3.5" />
                                                {t("dashboard.today.addExpense")}
                                            </Button>
                                        }
                                        initialData={{
                                            title: selectedItem.title,
                                            date: todayLocalDateYYYYMMDD(),
                                            category: mapToExpenseCategory(selectedItem.type),
                                            city: currentCity,
                                            // 홈 화면에서도 이 일정과 지출이 연동되도록 scheduleId 설정
                                            scheduleId: selectedItem.id,
                                        }}
                                        onExpenseAdded={() => {
                                            alert(t("dashboard.today.expenseAdded"));
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                    if (selectedItem) {
                        fetchLinkedExpenses(selectedItem.id);
                    }
                }}
            />
        </div>
    );
}

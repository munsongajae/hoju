"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plane, Users, MapPin, Loader2, Calendar, BarChart3, Download, Upload, DollarSign, RefreshCw, AlertCircle, CheckCircle2, Plus, Trash2, Check, HelpCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { differenceInDays, parseISO, isValid, format } from "date-fns";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ko } from "date-fns/locale";
import { useTrip } from "@/contexts/TripContext";
import { cn } from "@/lib/utils";

interface TripSettings {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    family_count: number;
    cities: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tripId, setTripId] = useState<string | null>(null);
    const toast = useToast();
    const { selectedTripId, selectedTrip, trips, setSelectedTripId, refreshTrips } = useTrip();
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

    // 여행 설정 상태
    const [tripTitle, setTripTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [familyCount, setFamilyCount] = useState(4);
    const [cities, setCities] = useState("");

    // 초기값 저장 (변경사항 추적용)
    const [initialValues, setInitialValues] = useState({
        tripTitle: "",
        startDate: "",
        endDate: "",
        familyCount: 4,
        cities: "",
    });

    // 통계 데이터
    const [stats, setStats] = useState({
        schedules: 0,
        expenses: 0,
        places: 0,
    });
    const [loadingStats, setLoadingStats] = useState(false);

    // 환율 설정
    type Currency = 'AUD' | 'USD' | 'VND';
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('AUD');
    const [exchangeRates, setExchangeRates] = useState<Record<Currency, number | null>>({
        AUD: null,
        USD: null,
        VND: null,
    });
    const [customExchangeRates, setCustomExchangeRates] = useState<Record<Currency, string>>({
        AUD: "",
        USD: "",
        VND: "",
    });
    const [useCustomRates, setUseCustomRates] = useState<Record<Currency, boolean>>({
        AUD: false,
        USD: false,
        VND: false,
    });
    const [loadingRate, setLoadingRate] = useState(false);

    // 선택된 trip의 설정 로드
    const loadTripSettings = useCallback(async (tripIdToLoad: string) => {
        try {
            console.log("loadTripSettings 호출됨:", tripIdToLoad);
            setLoading(true);
            const { data, error } = await supabase
                .from("trips")
                .select("*")
                .eq("id", tripIdToLoad)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error loading settings:", error);
            }

            if (data) {
                console.log("Trip 설정 로드됨:", data);
                setTripId(data.id);
                const title = data.title || "";
                const start = data.start_date || "";
                const end = data.end_date || "";
                const count = data.family_count || 4;
                const citiesList = data.cities || "";

                setTripTitle(title);
                setStartDate(start);
                setEndDate(end);
                setFamilyCount(count);
                setCities(citiesList);

                // 초기값 저장
                setInitialValues({
                    tripTitle: title,
                    startDate: start,
                    endDate: end,
                    familyCount: count,
                    cities: citiesList,
                });
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 통계 데이터 로드
    const loadStats = useCallback(async () => {
        if (!selectedTripId) {
            setStats({ schedules: 0, expenses: 0, places: 0 });
            return;
        }

        setLoadingStats(true);
        try {
            const [schedulesResult, expensesResult, placesResult] = await Promise.all([
                supabase.from("schedules").select("id", { count: "exact", head: true }).eq("trip_id", selectedTripId),
                supabase.from("expenses").select("id", { count: "exact", head: true }).eq("trip_id", selectedTripId),
                supabase.from("places").select("id", { count: "exact", head: true }).eq("trip_id", selectedTripId),
            ]);

            setStats({
                schedules: schedulesResult.count || 0,
                expenses: expensesResult.count || 0,
                places: placesResult.count || 0,
            });
        } catch (err) {
            console.error("Failed to load stats:", err);
        } finally {
            setLoadingStats(false);
        }
    }, [selectedTripId]);

    // 선택된 trip이 변경되면 해당 trip의 설정 로드
    useEffect(() => {
        if (selectedTripId) {
            // 이미 로드된 trip이면 스킵 (중복 호출 방지)
            if (tripId === selectedTripId) {
                console.log("이미 로드된 trip, 스킵:", selectedTripId);
                return;
            }
            
            console.log("selectedTripId 변경됨, 설정 로드:", selectedTripId);
            loadTripSettings(selectedTripId);
            loadStats();
        } else {
            setLoading(false);
            setStats({ schedules: 0, expenses: 0, places: 0 });
        }
        loadExchangeRate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTripId]);

    // 선택된 통화가 변경되면 해당 통화의 환율 로드
    useEffect(() => {
        if (selectedCurrency) {
            loadExchangeRate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrency]);

    // 환율 로드
    const loadExchangeRate = async () => {
        setLoadingRate(true);
        try {
            // 선택된 통화의 환율만 가져오기
            try {
                const response = await fetch(`/api/exchange-rate?currency=${selectedCurrency}`);
                const data = await response.json();
                if (data.rate) {
                    setExchangeRates((prev) => ({
                        ...prev,
                        [selectedCurrency]: data.rate,
                    }));
                }
            } catch (err) {
                console.error(`Failed to load ${selectedCurrency} rate:`, err);
            }

            // 저장된 사용자 설정 환율 가져오기 (localStorage)
            const savedCustomRate = localStorage.getItem(`customExchangeRate_${selectedCurrency}`);
            const savedUseCustom = localStorage.getItem(`useCustomExchangeRate_${selectedCurrency}`);
            if (savedCustomRate) {
                setCustomExchangeRates((prev) => ({
                    ...prev,
                    [selectedCurrency]: savedCustomRate,
                }));
            }
            if (savedUseCustom === 'true') {
                setUseCustomRates((prev) => ({
                    ...prev,
                    [selectedCurrency]: true,
                }));
            }

            // 저장된 선택된 통화 가져오기 (초기 로드 시)
            const savedCurrency = localStorage.getItem('selectedCurrency') as Currency | null;
            if (savedCurrency && ['AUD', 'USD', 'VND'].includes(savedCurrency)) {
                setSelectedCurrency(savedCurrency);
                // 저장된 통화의 환율도 로드
                try {
                    const response = await fetch(`/api/exchange-rate?currency=${savedCurrency}`);
                    const data = await response.json();
                    if (data.rate) {
                        setExchangeRates((prev) => ({
                            ...prev,
                            [savedCurrency]: data.rate,
                        }));
                    }
                } catch (err) {
                    console.error(`Failed to load ${savedCurrency} rate:`, err);
                }
            }
        } catch (err) {
            console.error("Failed to load exchange rate:", err);
        } finally {
            setLoadingRate(false);
        }
    };

    // 환율 저장
    const handleSaveExchangeRate = (currency: Currency) => {
        const useCustom = useCustomRates[currency];
        const customRate = customExchangeRates[currency];

        if (useCustom && customRate) {
            const rate = parseFloat(customRate);
            if (isNaN(rate) || rate <= 0) {
                toast.error("올바른 환율을 입력해주세요.");
                return;
            }
            localStorage.setItem(`customExchangeRate_${currency}`, customRate);
            localStorage.setItem(`useCustomExchangeRate_${currency}`, 'true');
            toast.success(`${currency} 환율 설정이 저장되었습니다.`);
        } else {
            localStorage.removeItem(`customExchangeRate_${currency}`);
            localStorage.setItem(`useCustomExchangeRate_${currency}`, 'false');
            toast.success(`${currency} 기본 환율을 사용합니다.`);
        }
    };

    // 데이터 내보내기
    const handleExportData = async () => {
        try {
            if (!selectedTripId) {
                toast.error("여행을 선택해주세요.");
                return;
            }

            const [tripsData, schedulesData, expensesData, placesData, checklistsData, budgetsData, memosData] = await Promise.all([
                supabase.from("trips").select("*").eq("id", selectedTripId),
                supabase.from("schedules").select("*").eq("trip_id", selectedTripId),
                supabase.from("expenses").select("*").eq("trip_id", selectedTripId),
                supabase.from("places").select("*").eq("trip_id", selectedTripId),
                supabase.from("checklists").select("*").eq("trip_id", selectedTripId),
                supabase.from("trip_budgets").select("*").eq("trip_id", selectedTripId),
                supabase.from("memos").select("*").eq("trip_id", selectedTripId),
            ]);

            const exportData = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                trips: tripsData.data || [],
                schedules: schedulesData.data || [],
                expenses: expensesData.data || [],
                places: placesData.data || [],
                checklists: checklistsData.data || [],
                budgets: budgetsData.data || [],
                memos: memosData.data || [],
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const tripTitleForFile = selectedTrip?.title || "trip";
            a.download = `hoju-backup-${tripTitleForFile}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("데이터가 내보내기되었습니다.");
        } catch (err: any) {
            console.error("Failed to export data:", err);
            toast.error(`내보내기 실패: ${err?.message || "알 수 없는 오류"}`);
        }
    };

    // 데이터 가져오기
    const handleImportData = async () => {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const text = await file.text();
                const importData = JSON.parse(text);

                if (!importData.version || !importData.trips) {
                    toast.error("올바른 백업 파일이 아닙니다.");
                    return;
                }

                if (!confirm("기존 데이터를 모두 삭제하고 가져온 데이터로 교체하시겠습니까?")) {
                    return;
                }

                // 데이터 가져오기
                if (importData.trips && importData.trips.length > 0) {
                    await supabase.from("trips").upsert(importData.trips[0], { onConflict: "id" });
                }

                if (importData.schedules && importData.schedules.length > 0) {
                    await supabase.from("schedules").upsert(importData.schedules, { onConflict: "id" });
                }

                if (importData.expenses && importData.expenses.length > 0) {
                    await supabase.from("expenses").upsert(importData.expenses, { onConflict: "id" });
                }

                if (importData.places && importData.places.length > 0) {
                    await supabase.from("places").upsert(importData.places, { onConflict: "id" });
                }

                if (importData.checklists && importData.checklists.length > 0) {
                    await supabase.from("checklists").upsert(importData.checklists, { onConflict: "id" });
                }

                if (importData.budgets && importData.budgets.length > 0) {
                    await supabase.from("trip_budgets").upsert(importData.budgets, { onConflict: "trip_id" });
                }

                if (importData.memos && importData.memos.length > 0) {
                    await supabase.from("memos").upsert(importData.memos, { onConflict: "id" });
                }

                // 가져온 trip이 있으면 선택
                if (importData.trips && importData.trips.length > 0) {
                    const importedTrip = importData.trips[0];
                    setSelectedTripId(importedTrip.id);
                    await refreshTrips();
                }

                toast.success("데이터가 가져와졌습니다.");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            };
            input.click();
        } catch (err: any) {
            console.error("Failed to import data:", err);
            toast.error(`가져오기 실패: ${err?.message || "알 수 없는 오류"}`);
        }
    };

    // 새 여행 생성
    const handleCreateNewTrip = () => {
        console.log("새 여행 추가 버튼 클릭됨");
        // tripId를 null로 설정하여 새 여행 생성 모드로 전환
        setTripId(null);
        
        // 기본값으로 새 여행 생성
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        setTripTitle("");
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextMonth.toISOString().split('T')[0]);
        setFamilyCount(4);
        setCities("");

        // 초기값도 리셋
        setInitialValues({
            tripTitle: "",
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            familyCount: 4,
            cities: "",
        });

        // 여행 정보 섹션으로 스크롤
        setTimeout(() => {
            document.getElementById("tripTitle")?.scrollIntoView({ behavior: "smooth", block: "center" });
            document.getElementById("tripTitle")?.focus();
        }, 100);
    };

    // 여행 삭제
    const handleDeleteTrip = async (tripIdToDelete: string, tripTitle: string) => {
        if (!confirm(`"${tripTitle}" 여행을 삭제하시겠습니까?\n\n연결된 모든 일정, 지출, 장소, 체크리스트가 함께 삭제됩니다.`)) {
            return;
        }

        setDeletingTripId(tripIdToDelete);
        try {
            const { error } = await supabase
                .from("trips")
                .delete()
                .eq("id", tripIdToDelete);

            if (error) throw error;

            // 삭제된 trip이 현재 선택된 trip이면 다른 trip 선택
            if (tripIdToDelete === selectedTripId) {
                const remainingTrips = trips.filter(t => t.id !== tripIdToDelete);
                if (remainingTrips.length > 0) {
                    setSelectedTripId(remainingTrips[0].id);
                } else {
                    setSelectedTripId(null);
                }
            }

            await refreshTrips();
            toast.success("여행이 삭제되었습니다.");
        } catch (err: any) {
            console.error("Failed to delete trip:", err);
            toast.error(`삭제 실패: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setDeletingTripId(null);
        }
    };

    // 날짜 유효성 검사
    const dateValidation = useMemo(() => {
        if (!startDate || !endDate) {
            return { isValid: true, message: "" };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!isValid(start) || !isValid(end)) {
            return { isValid: false, message: "올바른 날짜를 입력해주세요." };
        }

        if (start > end) {
            return { isValid: false, message: "출발일은 귀국일보다 이전이어야 합니다." };
        }

        return { isValid: true, message: "" };
    }, [startDate, endDate]);

    // 여행 기간 계산
    const tripDuration = useMemo(() => {
        if (!startDate || !endDate || !dateValidation.isValid) {
            return null;
        }

        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const days = differenceInDays(end, start) + 1; // +1은 시작일 포함

        return days;
    }, [startDate, endDate, dateValidation.isValid]);

    // 변경사항 확인
    const hasChanges = useMemo(() => {
        // 초기값이 모두 비어있으면 (새 여행 생성) 항상 true
        if (!initialValues.tripTitle && !initialValues.startDate && !initialValues.endDate) {
            return tripTitle.trim() !== "" || startDate !== "" || endDate !== "";
        }
        
        return (
            tripTitle.trim() !== initialValues.tripTitle ||
            startDate !== initialValues.startDate ||
            endDate !== initialValues.endDate ||
            familyCount !== initialValues.familyCount ||
            cities.trim() !== initialValues.cities
        );
    }, [tripTitle, startDate, endDate, familyCount, cities, initialValues]);
    
    // 저장 가능 여부 (필수 필드가 입력되어 있고 유효한 경우)
    const canSave = useMemo(() => {
        return (
            tripTitle.trim() !== "" &&
            startDate !== "" &&
            endDate !== "" &&
            dateValidation.isValid &&
            familyCount >= 1 &&
            familyCount <= 20
        );
    }, [tripTitle, startDate, endDate, dateValidation.isValid, familyCount]);

    const handleSave = async () => {
        console.log("handleSave 시작, tripId:", tripId, "tripTitle:", tripTitle, "selectedTripId:", selectedTripId);
        
        // 유효성 검사
        if (!tripTitle.trim()) {
            toast.error("여행 제목을 입력해주세요.");
            return;
        }

        if (!startDate || !endDate) {
            toast.error("출발일과 귀국일을 모두 입력해주세요.");
            return;
        }

        if (!dateValidation.isValid) {
            toast.error(dateValidation.message);
            return;
        }

        if (familyCount < 1 || familyCount > 20) {
            toast.error("인원 수는 1명 이상 20명 이하여야 합니다.");
            return;
        }

        setSaving(true);
        try {
            const tripData = {
                title: tripTitle.trim(),
                start_date: startDate,
                end_date: endDate,
                family_count: familyCount,
                cities: cities.trim(),
            };

            // tripId가 없으면 selectedTripId를 사용
            const tripIdToUse = tripId || selectedTripId;
            console.log("사용할 tripId:", tripIdToUse);

            if (tripIdToUse) {
                console.log("기존 여행 업데이트:", tripIdToUse);
                // 기존 여행 정보 업데이트
                const { error } = await supabase
                    .from("trips")
                    .update(tripData)
                    .eq("id", tripIdToUse);

                if (error) {
                    console.error("여행 업데이트 에러:", error);
                    throw error;
                }

                // tripId가 없었으면 설정
                if (!tripId) {
                    setTripId(tripIdToUse);
                }
            } else {
                // 새 여행 정보 생성
                console.log("새 여행 생성 시작");
                const { data: newTripData, error } = await supabase
                    .from("trips")
                    .insert([tripData])
                    .select()
                    .single();

                console.log("새 여행 생성 결과:", { newTripData, error });

                if (error) {
                    console.error("새 여행 생성 에러:", error);
                    throw error;
                }
                
                if (newTripData) {
                    const newId = newTripData.id;
                    console.log("새 여행 ID:", newId);
                    setTripId(newId);
                    
                    // 초기값 업데이트
                    setInitialValues({
                        tripTitle: tripTitle.trim(),
                        startDate,
                        endDate,
                        familyCount,
                        cities: cities.trim(),
                    });

                    // trip 목록 새로고침 (새 여행 생성 후)
                    console.log("새 여행 생성됨, 목록 새로고침 시작:", newId);
                    await refreshTrips();
                    console.log("목록 새로고침 완료");
                    
                    // 새로 생성된 trip을 선택 (목록 새로고침 후 약간의 지연)
                    setTimeout(() => {
                        setSelectedTripId(newId);
                    }, 200);
                    
                    toast.success("새 여행이 추가되었습니다! ✅");
                    return; // 새 여행 생성 시 여기서 종료
                } else {
                    console.error("newTripData가 null입니다");
                }
            }

                // 초기값 업데이트 (기존 여행 업데이트 시)
                setInitialValues({
                    tripTitle: tripTitle.trim(),
                    startDate,
                    endDate,
                    familyCount,
                    cities: cities.trim(),
                });

                // trip 목록 새로고침 (업데이트 후)
                await refreshTrips();

                toast.success("설정이 저장되었습니다! ✅");
        } catch (err: any) {
            const errorMessage = err?.message || err?.code || "알 수 없는 오류";
            console.error("Failed to save settings:", errorMessage, err);
            toast.error(`저장 중 오류가 발생했습니다: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
            <div className="p-4 pb-24 space-y-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                        </Button>
                        <h1 className="text-2xl font-bold">설정</h1>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/help"><HelpCircle className="w-5 h-5" /></Link>
                    </Button>
                </div>

                {/* 여행 선택 섹션 */}
                <Collapsible defaultOpen={true}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Plane className="w-5 h-5 text-primary" />
                                    여행 선택
                                </CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="space-y-4">
                                {trips.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="mb-2">등록된 여행이 없습니다.</p>
                                        <p className="text-sm">아래에서 새 여행을 추가해주세요.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {trips.map((trip) => {
                                            const isSelected = trip.id === selectedTripId;
                                            const tripStart = parseISO(trip.start_date);
                                            const tripEnd = parseISO(trip.end_date);
                                            const duration = differenceInDays(tripEnd, tripStart) + 1;

                                            return (
                                                <div
                                                    key={trip.id}
                                                    className={cn(
                                                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                                                        isSelected
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                    onClick={async () => {
                                                        console.log("여행 카드 클릭:", trip.id);
                                                        setSelectedTripId(trip.id);
                                                        // loadTripSettings는 useEffect에서 자동으로 호출됨
                                                        toast.success(`${trip.title} 여행으로 전환했습니다.`);
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-bold text-base">{trip.title}</h3>
                                                                {isSelected && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        <Check className="w-3 h-3 mr-1" />
                                                                        현재
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <p>
                                                                    {format(tripStart, "yyyy.MM.dd", { locale: ko })} - {format(tripEnd, "yyyy.MM.dd", { locale: ko })} ({duration}일)
                                                                </p>
                                                                {trip.cities && (
                                                                    <p className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {trip.cities.split(',').slice(0, 2).join(', ')}
                                                                        {trip.cities.split(',').length > 2 && '...'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTrip(trip.id, trip.title);
                                                            }}
                                                            disabled={deletingTripId === trip.id}
                                                        >
                                                            {deletingTripId === trip.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <Button
                                    onClick={handleCreateNewTrip}
                                    className="w-full gap-2"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4" />
                                    새 여행 추가
                                </Button>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* 여행 요약 카드 */}
                {tripTitle && startDate && endDate && dateValidation.isValid && (
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold">{tripTitle || "여행 제목 없음"}</h2>
                                    {tripDuration !== null && tripDuration > 0 && (
                                        <Badge variant="secondary" className="text-sm">
                                            {tripDuration}일
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">출발일</p>
                                        <p className="font-medium">
                                            {startDate ? format(parseISO(startDate), "yyyy년 MM월 dd일 (EEE)", { locale: ko }) : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">귀국일</p>
                                        <p className="font-medium">
                                            {endDate ? format(parseISO(endDate), "yyyy년 MM월 dd일 (EEE)", { locale: ko }) : "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm pt-2 border-t">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">인원:</span>
                                        <span className="font-medium">{familyCount}명</span>
                                    </div>
                                    {cities && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">도시:</span>
                                            <span className="font-medium">{cities.split(',').length}개</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* 여행 기본 정보 */}
            <Collapsible defaultOpen={true}>
                <Card>
                    <CardHeader className="pb-3">
                        <CollapsibleTrigger className="w-full">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Plane className="w-5 h-5 text-primary" />
                                여행 정보
                            </CardTitle>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tripTitle">여행 제목</Label>
                        <Input
                            id="tripTitle"
                            value={tripTitle}
                            onChange={(e) => setTripTitle(e.target.value)}
                            placeholder="예: 호주 가족여행"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">출발일</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={!dateValidation.isValid && startDate && endDate ? "border-red-500" : ""}
                            />
                            {!dateValidation.isValid && startDate && endDate && (
                                <p className="text-xs text-red-500">{dateValidation.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">귀국일</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={!dateValidation.isValid && startDate && endDate ? "border-red-500" : ""}
                            />
                        </div>
                    </div>

                    {/* 여행 기간 표시 */}
                    {tripDuration !== null && tripDuration > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">
                                여행 기간: <span className="text-primary">{tripDuration}일</span>
                            </span>
                        </div>
                    )}

                    <Separator />

                    {/* 여행 구성원 */}
                    <div className="space-y-2">
                        <Label htmlFor="familyCount" className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            인원 수
                        </Label>
                        <Input
                            id="familyCount"
                            type="number"
                            min={1}
                            max={20}
                            value={familyCount}
                            onChange={(e) => setFamilyCount(Number(e.target.value))}
                        />
                    </div>

                    <Separator />

                    {/* 방문 도시 */}
                    <div className="space-y-2">
                        <Label htmlFor="cities" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            방문 도시 (쉼표로 구분)
                        </Label>
                        <Input
                            id="cities"
                            value={cities}
                            onChange={(e) => setCities(e.target.value)}
                            placeholder="예: 시드니, 멜버른, 브리즈번"
                        />
                        <p className="text-xs text-muted-foreground">
                            입력한 도시는 일정 필터에서 사용됩니다.
                        </p>
                    </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* 저장 버튼 */}
            <Card className={hasChanges && canSave ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        {hasChanges && canSave && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="font-medium">변경사항이 있습니다</span>
                            </div>
                        )}
                        {!canSave && (tripTitle.trim() !== "" || startDate !== "" || endDate !== "") && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="w-4 h-4" />
                                <span>필수 정보를 모두 입력해주세요</span>
                            </div>
                        )}
                        {!hasChanges && canSave && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>모든 변경사항이 저장되었습니다</span>
                            </div>
                        )}
                        <Button 
                            onClick={() => {
                                console.log("저장 버튼 클릭됨", { saving, canSave, hasChanges, tripId });
                                handleSave();
                            }} 
                            className="w-full gap-2 h-11" 
                            disabled={saving || !canSave}
                            variant={hasChanges && canSave ? "default" : "outline"}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    저장 중...
                                </>
                            ) : canSave ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    {hasChanges ? "변경사항 저장" : "저장"}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    저장
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* 여행 통계 */}
            <Collapsible defaultOpen={false}>
                <Card>
                    <CardHeader className="pb-3">
                        <CollapsibleTrigger className="w-full">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                여행 통계
                            </CardTitle>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                    {loadingStats ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold text-primary">{stats.schedules}</p>
                                <p className="text-xs text-muted-foreground mt-1">일정</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold text-primary">{stats.expenses}</p>
                                <p className="text-xs text-muted-foreground mt-1">지출</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold text-primary">{stats.places}</p>
                                <p className="text-xs text-muted-foreground mt-1">장소</p>
                            </div>
                        </div>
                    )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* 환율 설정 */}
            <Collapsible defaultOpen={false}>
                <Card>
                    <CardHeader className="pb-3">
                        <CollapsibleTrigger className="w-full">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="w-5 h-5 text-primary" />
                                환율 설정
                            </CardTitle>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                    {loadingRate ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {/* 외화 선택 */}
                                <div className="space-y-2">
                                    <Label htmlFor="currencySelect">외화 선택</Label>
                                    <select
                                        id="currencySelect"
                                        value={selectedCurrency}
                                        onChange={(e) => {
                                            const newCurrency = e.target.value as Currency;
                                            setSelectedCurrency(newCurrency);
                                            localStorage.setItem('selectedCurrency', newCurrency);
                                            // 선택된 통화 변경 시 해당 통화의 환율 로드
                                            loadExchangeRate();
                                        }}
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="AUD">호주 달러 (AUD)</option>
                                        <option value="USD">미국 달러 (USD)</option>
                                        <option value="VND">베트남 동 (VND)</option>
                                    </select>
                                </div>

                                {/* 선택된 외화 설정 */}
                                <div className="space-y-2 p-3 border rounded-lg">
                                    {(() => {
                                        const currencyNames = { AUD: '호주 달러', USD: '미국 달러', VND: '베트남 동' };
                                        const currency = selectedCurrency;
                                        const useCustom = useCustomRates[currency];
                                        const exchangeRate = exchangeRates[currency];
                                        const customRate = customExchangeRates[currency];

                                        return (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-medium">{currencyNames[currency]} ({currency})</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={loadExchangeRate}
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`useCustomRate_${currency}`}
                                                        checked={useCustom}
                                                        onCheckedChange={(checked) => 
                                                            setUseCustomRates((prev) => ({
                                                                ...prev,
                                                                [currency]: checked === true,
                                                            }))
                                                        }
                                                    />
                                                    <Label htmlFor={`useCustomRate_${currency}`} className="cursor-pointer text-sm">
                                                        사용자 지정 환율 사용
                                                    </Label>
                                                </div>
                                                {exchangeRate && !useCustom && (
                                                    <div className="p-2 bg-muted rounded">
                                                        <span className="text-sm font-medium">1 {currency} = {exchangeRate} KRW</span>
                                                    </div>
                                                )}
                                                {useCustom && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`customRate_${currency}`} className="text-sm">
                                                            사용자 지정 환율 (1 {currency} = ? KRW)
                                                        </Label>
                                                        <Input
                                                            id={`customRate_${currency}`}
                                                            type="number"
                                                            step="0.01"
                                                            min="1"
                                                            value={customRate}
                                                            onChange={(e) => 
                                                                setCustomExchangeRates((prev) => ({
                                                                    ...prev,
                                                                    [currency]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder={exchangeRate ? exchangeRate.toString() : "환율 입력"}
                                                        />
                                                    </div>
                                                )}
                                                <Button 
                                                    onClick={() => handleSaveExchangeRate(currency)} 
                                                    className="w-full" 
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    {currency} 환율 저장
                                                </Button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </>
                    )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* 데이터 관리 */}
            <Collapsible defaultOpen={false}>
                <Card>
                    <CardHeader className="pb-3">
                        <CollapsibleTrigger className="w-full">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Download className="w-5 h-5 text-primary" />
                                데이터 관리
                            </CardTitle>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            여행 데이터를 백업하거나 복원할 수 있습니다.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleExportData}
                                variant="outline"
                                className="flex-1 gap-2"
                                disabled={!selectedTripId}
                            >
                                <Download className="w-4 h-4" />
                                내보내기
                            </Button>
                            <Button
                                onClick={handleImportData}
                                variant="outline"
                                className="flex-1 gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                가져오기
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ⚠️ 가져오기는 기존 데이터를 모두 교체합니다.
                        </p>
                    </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <Separator />

            {/* 앱 정보 */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>FamilyTrip.OS v1.0</p>
                <p>한달 가족여행 전용 운영 시스템</p>
            </div>
            </div>
        </>
    );
}

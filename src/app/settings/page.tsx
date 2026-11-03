"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plane, Users, MapPin, Loader2, Calendar, BarChart3, Download, Upload, DollarSign, RefreshCw, Plus, Trash2, HelpCircle, Sparkles, ChevronRight, Eye, EyeOff, Key } from "lucide-react";
import Link from "next/link";
import { db, generateId } from "@/lib/db";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { differenceInDays, isValid, format } from "date-fns";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ko } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { useTrip } from "@/contexts/TripContext";
import { cn } from "@/lib/utils";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { fetchExchangeRate } from '@/lib/exchangeRate';
import {
    FONT_SCALE_LEVELS,
    FontScaleOption,
    getSavedFontScaleOption,
    saveAndApplyFontScale,
} from "@/lib/fontScale";
import { useTranslation } from "react-i18next";
import { AppLanguage, LANGUAGE_LABELS, LANGUAGE_STORAGE_KEY } from "@/lib/language";
import { getGeminiApiKey, saveGeminiApiKey, clearGeminiApiKey } from "@/lib/gemini";
import { formatLocalDateYYYYMMDD, parseIsoToLocalDate, todayLocalDateYYYYMMDD } from "@/lib/localDate";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tripId, setTripId] = useState<string | null>(null);
    const [fontScaleOption, setFontScaleOption] = useState<FontScaleOption>("3");
    const toast = useToast();
    const { t, i18n } = useTranslation();
    const language: AppLanguage = (i18n.resolvedLanguage ?? i18n.language ?? "ko").toLowerCase().startsWith("en") ? "en" : "ko";
    const setLanguage = useCallback((nextLanguage: AppLanguage) => {
        void i18n.changeLanguage(nextLanguage);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
        }
    }, [i18n]);
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [geminiApiKeyInput, setGeminiApiKeyInput] = useState("");
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const dateLocale = language === "en" ? enUS : ko;
    const { selectedTripId, selectedTrip, trips, setSelectedTripId, refreshTrips } = useTrip();
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
    const [tripInfoDialogOpen, setTripInfoDialogOpen] = useState(false);

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

    // 환율 설정
    type Currency = 'KRW' | 'AUD' | 'USD' | 'VND' | 'JPY' | 'EUR' | 'CNY' | 'HKD' | 'TWD' | 'SGD' | 'THB' | 'IDR' | 'PHP' | 'MYR' | 'INR' | 'PKR' | 'BDT' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'IRR' | 'ILS' | 'TRY' | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RUB' | 'RON' | 'BGN' | 'CAD' | 'MXN' | 'CUP' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'VES' | 'ZAR' | 'EGP' | 'NGN' | 'KES' | 'MAD' | 'GHS' | 'NZD';
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('AUD');
    const [exchangeRates, setExchangeRates] = useState<Record<Currency, number | null>>({
        KRW: null, AUD: null, USD: null, VND: null, JPY: null, EUR: null, CNY: null, HKD: null, TWD: null, SGD: null, THB: null, IDR: null, PHP: null, MYR: null, INR: null, PKR: null, BDT: null, AED: null, SAR: null, QAR: null, KWD: null, IRR: null, ILS: null, TRY: null, GBP: null, CHF: null, SEK: null, NOK: null, DKK: null, PLN: null, CZK: null, HUF: null, RUB: null, RON: null, BGN: null, CAD: null, MXN: null, CUP: null, BRL: null, ARS: null, CLP: null, COP: null, PEN: null, VES: null, ZAR: null, EGP: null, NGN: null, KES: null, MAD: null, GHS: null, NZD: null,
    });
    const [customExchangeRates, setCustomExchangeRates] = useState<Record<Currency, string>>({
        KRW: "", AUD: "", USD: "", VND: "", JPY: "", EUR: "", CNY: "", HKD: "", TWD: "", SGD: "", THB: "", IDR: "", PHP: "", MYR: "", INR: "", PKR: "", BDT: "", AED: "", SAR: "", QAR: "", KWD: "", IRR: "", ILS: "", TRY: "", GBP: "", CHF: "", SEK: "", NOK: "", DKK: "", PLN: "", CZK: "", HUF: "", RUB: "", RON: "", BGN: "", CAD: "", MXN: "", CUP: "", BRL: "", ARS: "", CLP: "", COP: "", PEN: "", VES: "", ZAR: "", EGP: "", NGN: "", KES: "", MAD: "", GHS: "", NZD: "",
    });
    const [useCustomRates, setUseCustomRates] = useState<Record<Currency, boolean>>({
        KRW: false, AUD: false, USD: false, VND: false, JPY: false, EUR: false, CNY: false, HKD: false, TWD: false, SGD: false, THB: false, IDR: false, PHP: false, MYR: false, INR: false, PKR: false, BDT: false, AED: false, SAR: false, QAR: false, KWD: false, IRR: false, ILS: false, TRY: false, GBP: false, CHF: false, SEK: false, NOK: false, DKK: false, PLN: false, CZK: false, HUF: false, RUB: false, RON: false, BGN: false, CAD: false, MXN: false, CUP: false, BRL: false, ARS: false, CLP: false, COP: false, PEN: false, VES: false, ZAR: false, EGP: false, NGN: false, KES: false, MAD: false, GHS: false, NZD: false,
    });
    const [loadingRate, setLoadingRate] = useState(false);
    const currencyGroups: Array<{ labelKey: string; options: Currency[] }> = [
        { labelKey: "settings.exchange.group.asia", options: ["KRW", "JPY", "CNY", "HKD", "TWD", "SGD", "THB", "VND", "IDR", "PHP", "MYR", "INR", "PKR", "BDT", "AED", "SAR", "QAR", "KWD", "IRR", "ILS", "TRY"] },
        { labelKey: "settings.exchange.group.europe", options: ["EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RUB", "RON", "BGN"] },
        { labelKey: "settings.exchange.group.oceaniaNorthAmerica", options: ["AUD", "NZD", "USD", "CAD", "MXN", "CUP"] },
        { labelKey: "settings.exchange.group.southAmerica", options: ["BRL", "ARS", "CLP", "COP", "PEN", "VES"] },
        { labelKey: "settings.exchange.group.africa", options: ["ZAR", "EGP", "NGN", "KES", "MAD", "GHS"] },
    ];
    const allCurrencies: Currency[] = currencyGroups.flatMap((group) => group.options);
    const currencyDisplayNames = useMemo(
        () => new Intl.DisplayNames([language], { type: "currency" }),
        [language]
    );
    const getCurrencyName = useCallback(
        (currency: Currency) => currencyDisplayNames.of(currency) ?? currency,
        [currencyDisplayNames]
    );

    useEffect(() => {
        const savedFontScale = getSavedFontScaleOption();
        setFontScaleOption(savedFontScale);
        const savedKey = getGeminiApiKey() || "";
        setGeminiApiKey(savedKey);
        setGeminiApiKeyInput(savedKey);
    }, []);

    // 선택된 trip의 설정 로드
    const loadTripSettings = useCallback(async (tripIdToLoad: string) => {
        try {
            console.log("loadTripSettings 호출됨:", tripIdToLoad);
            setLoading(true);
            const data = await db.trips.get(tripIdToLoad);

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
            console.error("Failed to load settings from Dexie:", err);
        } finally {
            setLoading(false);
        }
    }, []);

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
        } else {
            setLoading(false);
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

    // 환율 로드 (콴런데 API Route 대신 fetchExchangeRate 유틸 사용)
    const loadExchangeRate = async () => {
        setLoadingRate(true);
        try {
            // 선택된 통화의 환율 가져오기
            const result = await fetchExchangeRate(selectedCurrency);
            if (result) {
                setExchangeRates((prev) => ({
                    ...prev,
                    [selectedCurrency]: result.rate,
                }));
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
            if (savedCurrency && allCurrencies.includes(savedCurrency)) {
                setSelectedCurrency(savedCurrency);
                const savedResult = await fetchExchangeRate(savedCurrency);
                if (savedResult) {
                    setExchangeRates((prev) => ({
                        ...prev,
                        [savedCurrency]: savedResult.rate,
                    }));
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
                toast.error(t("settings.alert.invalidRate"));
                return;
            }
            localStorage.setItem(`customExchangeRate_${currency}`, customRate);
            localStorage.setItem(`useCustomExchangeRate_${currency}`, 'true');
            toast.success(t("settings.alert.rateSaved", { currency }));
        } else {
            localStorage.removeItem(`customExchangeRate_${currency}`);
            localStorage.setItem(`useCustomExchangeRate_${currency}`, 'false');
            toast.success(t("settings.alert.rateDefault", { currency }));
        }
    };

    const handleFontScaleChange = (option: FontScaleOption) => {
        setFontScaleOption(option);
        saveAndApplyFontScale(option);
        toast.success(t("settings.alert.fontApplied"));
    };

    // 데이터 내보내기
    const handleExportData = async () => {
        try {
            if (!selectedTripId) {
                toast.error(t("settings.alert.selectTrip"));
                return;
            }

            const [
                tripsData,
                schedulesData,
                expensesData,
                placesData,
                checklistsData,
                budgetsData,
                memosData,
                diariesData,
                mapLinksData,
            ] = await Promise.all([
                db.trips.where("id").equals(selectedTripId).toArray(),
                db.schedules.where("trip_id").equals(selectedTripId).toArray(),
                db.expenses.where("trip_id").equals(selectedTripId).toArray(),
                db.places.where("trip_id").equals(selectedTripId).toArray(),
                db.checklists.where("trip_id").equals(selectedTripId).toArray(),
                db.trip_budgets.where("trip_id").equals(selectedTripId).toArray(),
                db.memos.where("trip_id").equals(selectedTripId).toArray(),
                db.diaries.where("trip_id").equals(selectedTripId).toArray(),
                db.google_map_links.where("trip_id").equals(selectedTripId).toArray(),
            ]);

            const exportData = {
                version: "1.1",
                exportDate: new Date().toISOString(),
                trips: tripsData || [],
                schedules: schedulesData || [],
                expenses: expensesData || [],
                places: placesData || [],
                checklists: checklistsData || [],
                budgets: budgetsData || [],
                memos: memosData || [],
                diaries: diariesData || [],
                google_map_links: mapLinksData || [],
            };

            const exportDataStr = JSON.stringify(exportData, null, 2);
            const tripTitleForFile = selectedTrip?.title || "trip";
            const fileName = `hoju-backup-${tripTitleForFile}-${todayLocalDateYYYYMMDD()}.json`;

            if (Capacitor.isNativePlatform()) {
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: exportDataStr,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });

                await Share.share({
                    title: t("settings.export.backupTitle"),
                    text: t("settings.export.backupText"),
                    url: result.uri,
                    dialogTitle: t("settings.export.backupDialog"),
                });
            } else {
                const blob = new Blob([exportDataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            toast.success(t("settings.alert.exportDone"));
        } catch (err: any) {
            console.error("Failed to export data:", err);
            toast.error(t("settings.alert.exportFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // 섹션별 데이터 내보내기
    const handleExportSection = async (section: string) => {
        try {
            if (!selectedTripId) {
                toast.error(t("settings.alert.selectTrip"));
                return;
            }

            let data: any[] = [];
            let tableName = "";
            let fileName = "";

            switch (section) {
                case "schedules":
                    data = await db.schedules.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.schedules");
                    fileName = "schedules";
                    break;
                case "expenses":
                    data = await db.expenses.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.expenses");
                    fileName = "expenses";
                    break;
                case "places":
                    data = await db.places.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.places");
                    fileName = "places";
                    break;
                case "diaries":
                    data = await db.diaries.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.diaries");
                    fileName = "diaries";
                    break;
                case "memos":
                    data = await db.memos.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.memos");
                    fileName = "memos";
                    break;
                case "checklists":
                    data = await db.checklists.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.checklists");
                    fileName = "checklists";
                    break;
                case "budgets":
                    data = await db.trip_budgets.where("trip_id").equals(selectedTripId).toArray() || [];
                    tableName = t("settings.data.section.budgets");
                    fileName = "budgets";
                    break;
                default:
                    toast.error(t("settings.alert.invalidSection"));
                    return;
            }

            const exportData = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                section: section,
                sectionName: tableName,
                tripTitle: selectedTrip?.title || "Unknown Trip",
                data: data,
            };

            const exportDataStr = JSON.stringify(exportData, null, 2);
            const tripTitleForFile = selectedTrip?.title || "trip";
            const fullFileName = `hoju-${fileName}-${tripTitleForFile}-${todayLocalDateYYYYMMDD()}.json`;

            if (Capacitor.isNativePlatform()) {
                const result = await Filesystem.writeFile({
                    path: fullFileName,
                    data: exportDataStr,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });

                await Share.share({
                    title: t("settings.export.sectionBackupTitle", { section: tableName }),
                    text: t("settings.export.sectionBackupText", { section: tableName }),
                    url: result.uri,
                    dialogTitle: t("settings.export.backupDialog"),
                });
            } else {
                const blob = new Blob([exportDataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fullFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            toast.success(t("settings.alert.sectionExportDone", { section: tableName }));
        } catch (err: any) {
            console.error(`Failed to export ${section}:`, err);
            toast.error(t("settings.alert.exportFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // 섹션별 데이터 가져오기
    const handleImportSection = async (section: string) => {
        try {
            if (!selectedTripId) {
                toast.error(t("settings.alert.selectTrip"));
                return;
            }

            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const importData = JSON.parse(text);

                    if (!importData.version || !importData.section) {
                        toast.error(t("settings.alert.invalidBackup"));
                        return;
                    }

                    if (importData.section !== section) {
                        toast.error(t("settings.alert.fileIsSection", { section: importData.sectionName || importData.section }));
                        return;
                    }

                    if (!confirm(t("settings.alert.sectionImportConfirm", { section: importData.sectionName || section }))) {
                        return;
                    }

                    // 기존 데이터 삭제
                    const targetTable = db.table(getTableName(section));
                    await targetTable.where("trip_id").equals(selectedTripId).delete();

                    // 새 데이터 가져오기
                    if (importData.data && importData.data.length > 0) {
                        // trip_id를 현재 선택된 여행으로 변경
                        const dataWithTripId = importData.data.map((item: any) => ({
                            ...item,
                            trip_id: selectedTripId,
                        }));

                        await targetTable.bulkPut(dataWithTripId);
                    }

                    toast.success(
                        t("settings.alert.sectionImportDone", {
                            section: importData.sectionName || section,
                        })
                    );
                } catch (err: any) {
                    console.error(`Failed to import ${section}:`, err);
                    toast.error(t("settings.alert.importFail", { message: err?.message || t("common.unknownError") }));
                }
            };
            input.click();
        } catch (err: any) {
            console.error(`Failed to import ${section}:`, err);
            toast.error(t("settings.alert.importFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // 섹션명을 테이블명으로 변환
    const getTableName = (section: string): string => {
        const tableMap: Record<string, string> = {
            schedules: "schedules",
            expenses: "expenses",
            places: "places",
            diaries: "diaries",
            memos: "memos",
            checklists: "checklists",
            budgets: "trip_budgets",
        };
        return tableMap[section] || section;
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

                if (!importData.version || !importData.trips || !Array.isArray(importData.trips) || importData.trips.length === 0) {
                    toast.error(t("settings.alert.invalidBackup"));
                    return;
                }

                if (!confirm(t("settings.alert.importConfirmAll"))) {
                    return;
                }

                // 백업 파일의 trip_id로 자식 데이터를 정규화하여, 가져온 trip 외 다른 데이터를 건드리지 않도록 한다.
                const importedTrip = importData.trips[0];
                const importedTripId: string = importedTrip.id;
                const filterToTrip = <T extends { trip_id?: string }>(rows: unknown): T[] => {
                    if (!Array.isArray(rows)) return [];
                    return (rows as T[])
                        .filter((row) => !row.trip_id || row.trip_id === importedTripId)
                        .map((row) => ({ ...row, trip_id: importedTripId }));
                };

                // 모든 쓰기 작업을 단일 트랜잭션으로 묶어 부분 실패를 방지한다.
                await db.transaction(
                    "rw",
                    [
                        db.trips,
                        db.schedules,
                        db.expenses,
                        db.places,
                        db.checklists,
                        db.trip_budgets,
                        db.memos,
                        db.diaries,
                        db.google_map_links,
                    ],
                    async () => {
                        await db.trips.put(importedTrip);

                        const schedules = filterToTrip<any>(importData.schedules);
                        if (schedules.length > 0) await db.schedules.bulkPut(schedules);

                        const expenses = filterToTrip<any>(importData.expenses);
                        if (expenses.length > 0) await db.expenses.bulkPut(expenses);

                        const places = filterToTrip<any>(importData.places);
                        if (places.length > 0) await db.places.bulkPut(places);

                        const checklists = filterToTrip<any>(importData.checklists);
                        if (checklists.length > 0) await db.checklists.bulkPut(checklists);

                        const budgets = filterToTrip<any>(importData.budgets);
                        if (budgets.length > 0) await db.trip_budgets.bulkPut(budgets);

                        const memos = filterToTrip<any>(importData.memos);
                        if (memos.length > 0) await db.memos.bulkPut(memos);

                        const diaries = filterToTrip<any>(importData.diaries);
                        if (diaries.length > 0) await db.diaries.bulkPut(diaries);

                        const mapLinks = filterToTrip<any>(importData.google_map_links);
                        if (mapLinks.length > 0) await db.google_map_links.bulkPut(mapLinks);
                    },
                );

                setSelectedTripId(importedTripId);
                await refreshTrips();

                toast.success(t("settings.alert.importDone"));
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            };
            input.click();
        } catch (err: any) {
            console.error("Failed to import data:", err);
            toast.error(t("settings.alert.importFail", { message: err?.message || t("common.unknownError") }));
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
        setStartDate(formatLocalDateYYYYMMDD(today));
        setEndDate(formatLocalDateYYYYMMDD(nextMonth));
        setFamilyCount(4);
        setCities("");

        // 초기값도 리셋
        setInitialValues({
            tripTitle: "",
            startDate: formatLocalDateYYYYMMDD(today),
            endDate: formatLocalDateYYYYMMDD(nextMonth),
            familyCount: 4,
            cities: "",
        });

        setTimeout(() => {
            setTripInfoDialogOpen(true);
        }, 50);
    };

    // 여행 삭제
    const handleDeleteTrip = async (tripIdToDelete: string, tripTitle: string) => {
        if (!confirm(t("settings.alert.tripDeleteConfirm", { title: tripTitle }))) {
            return;
        }

        setDeletingTripId(tripIdToDelete);
        try {
            // trip 본체와 연관 데이터를 단일 트랜잭션에서 삭제하여 고아 레코드를 방지한다.
            await db.transaction(
                "rw",
                [
                    db.trips,
                    db.schedules,
                    db.expenses,
                    db.places,
                    db.checklists,
                    db.trip_budgets,
                    db.diaries,
                    db.memos,
                    db.google_map_links,
                ],
                async () => {
                    await Promise.all([
                        db.trips.delete(tripIdToDelete),
                        db.schedules.where("trip_id").equals(tripIdToDelete).delete(),
                        db.expenses.where("trip_id").equals(tripIdToDelete).delete(),
                        db.places.where("trip_id").equals(tripIdToDelete).delete(),
                        db.checklists.where("trip_id").equals(tripIdToDelete).delete(),
                        db.trip_budgets.where("trip_id").equals(tripIdToDelete).delete(),
                        db.diaries.where("trip_id").equals(tripIdToDelete).delete(),
                        db.memos.where("trip_id").equals(tripIdToDelete).delete(),
                        db.google_map_links.where("trip_id").equals(tripIdToDelete).delete(),
                    ]);
                },
            );

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
            toast.success(t("settings.alert.tripDeleted"));
        } catch (err: any) {
            console.error("Failed to delete trip:", err);
            toast.error(t("settings.alert.deleteFail", { message: err?.message || t("common.unknownError") }));
        } finally {
            setDeletingTripId(null);
        }
    };

    // 날짜 유효성 검사
    const dateValidation = useMemo(() => {
        if (!startDate || !endDate) {
            return { isValid: true, message: "" };
        }

        const start = parseIsoToLocalDate(startDate);
        const end = parseIsoToLocalDate(endDate);

        if (!isValid(start) || !isValid(end)) {
            return { isValid: false, message: t("settings.alert.invalidDate") };
        }

        if (start > end) {
            return { isValid: false, message: t("settings.alert.startBeforeEnd") };
        }

        return { isValid: true, message: "" };
    }, [startDate, endDate, t]);

    // 여행 기간 계산
    const tripDuration = useMemo(() => {
        if (!startDate || !endDate || !dateValidation.isValid) {
            return null;
        }

        const start = parseIsoToLocalDate(startDate);
        const end = parseIsoToLocalDate(endDate);
        const days = differenceInDays(end, start) + 1; // +1은 시작일 포함

        return days;
    }, [startDate, endDate, dateValidation.isValid]);

    const showCurrentTripSummary = useMemo(
        () =>
            Boolean(
                selectedTripId &&
                    tripId === selectedTripId &&
                    trips.some((t) => t.id === selectedTripId)
            ),
        [selectedTripId, tripId, trips]
    );

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
            toast.error(t("settings.alert.tripTitleRequired"));
            return;
        }

        if (!startDate || !endDate) {
            toast.error(t("settings.alert.tripDatesRequired"));
            return;
        }

        if (!dateValidation.isValid) {
            toast.error(dateValidation.message);
            return;
        }

        if (familyCount < 1 || familyCount > 20) {
            toast.error(t("settings.alert.familyCountRange"));
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

            // tripId가 없으면 새 여행 생성
            const tripIdToUse = tripId;
            console.log("사용할 tripId:", tripIdToUse);

            if (tripIdToUse) {
                console.log("기존 여행 업데이트:", tripIdToUse);
                // 기존 여행 정보 업데이트
                await db.trips.update(tripIdToUse, tripData);

                // tripId가 없었으면 설정
                if (!tripId) {
                    setTripId(tripIdToUse);
                }
            } else {
                // 새 여행 정보 생성
                console.log("새 여행 생성 시작");
                const newId = generateId();
                const newTripData = {
                    id: newId,
                    ...tripData,
                    created_at: new Date().toISOString()
                };

                await db.trips.add(newTripData);

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

                toast.success(t("settings.alert.tripCreated"));
                setTripInfoDialogOpen(false);
                return; // 새 여행 생성 시 여기서 종료
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

            toast.success(t("settings.alert.saved"));
            setTripInfoDialogOpen(false);
        } catch (err: any) {
            const errorMessage = err?.message || err?.code || t("common.unknownError");
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
            <Dialog open={tripInfoDialogOpen} onOpenChange={setTripInfoDialogOpen}>
                <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-lg" showCloseButton>
                    <DialogHeader>
                        <DialogTitle>{t("settings.tripInfo.title")}</DialogTitle>
                        <DialogDescription>{t("settings.tripInfo.dialogDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="tripInfoDialog-tripTitle">{t("settings.tripInfo.tripTitle")}</Label>
                            <Input
                                id="tripInfoDialog-tripTitle"
                                autoFocus
                                value={tripTitle}
                                onChange={(e) => setTripTitle(e.target.value)}
                                placeholder={t("settings.tripInfo.tripTitlePlaceholder")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="tripInfoDialog-startDate">{t("settings.tripInfo.startDate")}</Label>
                                <Input
                                    id="tripInfoDialog-startDate"
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
                                <Label htmlFor="tripInfoDialog-endDate">{t("settings.tripInfo.endDate")}</Label>
                                <Input
                                    id="tripInfoDialog-endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={!dateValidation.isValid && startDate && endDate ? "border-red-500" : ""}
                                />
                            </div>
                        </div>

                        {tripDuration !== null && tripDuration > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">
                                    <span className="text-primary">
                                        {t("settings.tripInfo.duration", { days: String(tripDuration) })}
                                    </span>
                                </span>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="tripInfoDialog-familyCount" className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {t("settings.tripInfo.familyCount")}
                            </Label>
                            <Input
                                id="tripInfoDialog-familyCount"
                                type="number"
                                min={1}
                                max={20}
                                value={familyCount}
                                onChange={(e) => setFamilyCount(Number(e.target.value))}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="tripInfoDialog-cities" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                {t("settings.tripInfo.cities")}
                            </Label>
                            <Input
                                id="tripInfoDialog-cities"
                                value={cities}
                                onChange={(e) => setCities(e.target.value)}
                                placeholder={t("settings.tripInfo.citiesPlaceholder")}
                            />
                            <p className="text-xs text-muted-foreground">{t("settings.tripInfo.citiesHint")}</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setTripInfoDialogOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="button"
                            className="gap-1.5"
                            disabled={saving || !canSave}
                            variant={hasChanges && canSave ? "default" : "outline"}
                            onClick={() => void handleSave()}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("settings.save.saving")}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {hasChanges && canSave ? t("settings.save.saveChanges") : t("settings.save.save")}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="p-3 pb-20 space-y-4">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/help"><HelpCircle className="w-5 h-5" /></Link>
                    </Button>
                </div>

                {/* 여행 요약 카드 — 탭 시 여행 정보 수정 다이얼로그 */}
                {/* 모바일 WebView에서 tripTitle 입력 시 카드가 '생성/삭제'되며 레이아웃이 튀는 현상 방지 */}
                {showCurrentTripSummary && (
                    <Card
                        role="button"
                        tabIndex={0}
                        onClick={() => setTripInfoDialogOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setTripInfoDialogOpen(true);
                            }
                        }}
                        className={cn(
                            "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer transition-[opacity,transform] hover:opacity-95 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            !tripTitle ? "invisible" : ""
                        )}
                        aria-label={t("settings.tripSummary.tapToEdit")}
                    >
                        <CardContent className="pt-4 pb-3">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold truncate">
                                            {tripTitle || t("settings.tripSummary.noTitle")}
                                        </h2>
                                        <Badge variant="default" className="shrink-0 text-xs font-medium">
                                            {t("settings.tripSummary.currentTrip")}
                                        </Badge>
                                    </div>
                                    {tripDuration !== null && tripDuration > 0 && (
                                        <Badge variant="secondary" className="text-sm shrink-0">
                                            {t("settings.tripSummary.days", { days: String(tripDuration) })}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">{t("settings.tripSummary.startDate")}</p>
                                        <p className="font-medium">
                                            {startDate && endDate && dateValidation.isValid
                                                ? format(parseIsoToLocalDate(startDate), "yyyy-MM-dd (EEE)", { locale: dateLocale })
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">{t("settings.tripSummary.endDate")}</p>
                                        <p className="font-medium">
                                            {startDate && endDate && dateValidation.isValid
                                                ? format(parseIsoToLocalDate(endDate), "yyyy-MM-dd (EEE)", { locale: dateLocale })
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm pt-1.5 border-t">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{t("settings.tripSummary.members")}</span>
                                            <span className="font-medium">
                                                {t("settings.tripSummary.membersCount", { count: familyCount })}
                                            </span>
                                        </div>
                                        {cities && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{t("settings.tripSummary.cities")}</span>
                                                <span className="font-medium">
                                                    {t("settings.tripSummary.citiesCount", { count: cities.split(",").length })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                                        <span>{t("settings.tripSummary.tapToEdit")}</span>
                                        <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 여행 선택 섹션 */}
                <Collapsible defaultOpen={true}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Plane className="w-5 h-5 text-primary" />
                                    {t("settings.tripSelect.title")}
                                </CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="space-y-2 pt-0">
                                {trips.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        <p className="mb-1">등록된 여행이 없습니다.</p>
                                        <p>아래에서 새 여행을 추가해주세요.</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <Select
                                            value={
                                                selectedTripId &&
                                                trips.some((t) => t.id === selectedTripId)
                                                    ? selectedTripId
                                                    : undefined
                                            }
                                            onValueChange={(id) => {
                                                setTripInfoDialogOpen(false);
                                                setSelectedTripId(id);
                                                const trip = trips.find((t) => t.id === id);
                                                if (trip) {
                                                    toast.success(
                                                        t("settings.tripSelect.switched", { title: trip.title })
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                className="w-full min-w-0 flex-1 h-10"
                                                aria-label={t("settings.tripSelect.title")}
                                            >
                                                <SelectValue placeholder={t("settings.tripSelect.placeholder")} />
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                className="max-h-[min(50vh,280px)] w-[var(--radix-select-trigger-width)]"
                                            >
                                                {trips.map((trip) => (
                                                    <SelectItem key={trip.id} value={trip.id} className="pr-8">
                                                        <span className="truncate">{trip.title}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                            aria-label={t("settings.tripSelect.deleteSelected")}
                                            disabled={
                                                !selectedTripId ||
                                                !trips.some((t) => t.id === selectedTripId) ||
                                                deletingTripId === selectedTripId
                                            }
                                            onClick={() => {
                                                const trip = trips.find((t) => t.id === selectedTripId);
                                                if (trip) handleDeleteTrip(trip.id, trip.title);
                                            }}
                                        >
                                            {deletingTripId === selectedTripId ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                                <Button
                                    onClick={handleCreateNewTrip}
                                    className="w-full gap-2 h-10"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4" />
                                    새 여행 추가
                                </Button>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Separator />

                {/* 환율 설정 */}
                <Collapsible defaultOpen={false}>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-3 pb-1">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="flex items-center gap-1.5 text-base">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    {t("settings.exchange.title")}
                                </CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="px-3 pb-3 space-y-2">
                                {loadingRate ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {/* 외화 선택 */}
                                            <div className="space-y-2">
                                                <Label htmlFor="currencySelect" className="text-xs">
                                                    {t("settings.exchange.currencySelect")}
                                                </Label>
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
                                                    className="w-full h-8 px-2 border border-input bg-background rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    {currencyGroups.map((group) => (
                                                        <optgroup key={group.labelKey} label={t(group.labelKey)}>
                                                            {group.options.map((currency) => (
                                                                <option key={currency} value={currency}>
                                                                    {getCurrencyName(currency)} ({currency})
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 선택된 외화 설정 */}
                                            <div className="space-y-2 p-2 border rounded-lg">
                                                {(() => {
                                                    const currency = selectedCurrency;
                                                    const useCustom = useCustomRates[currency];
                                                    const exchangeRate = exchangeRates[currency];
                                                    const customRate = customExchangeRates[currency];

                                                    return (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <Label className="font-medium">{getCurrencyName(currency)} ({currency})</Label>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={loadExchangeRate}
                                                                >
                                                                    <RefreshCw className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
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
                                                                <Label htmlFor={`useCustomRate_${currency}`} className="cursor-pointer text-xs">
                                                                    {t("settings.exchange.useCustomRate")}
                                                                </Label>
                                                            </div>
                                                            {exchangeRate && !useCustom && (
                                                                <div className="p-2 bg-muted rounded">
                                                                    <span className="text-xs font-medium">1 {currency} = {exchangeRate} KRW</span>
                                                                </div>
                                                            )}
                                                            {useCustom && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`customRate_${currency}`} className="text-xs">
                                                                        {t("settings.exchange.customRateLabel", { currency })}
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
                                                                        placeholder={exchangeRate ? exchangeRate.toString() : t("settings.exchange.ratePlaceholder")}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>
                                                            )}
                                                            {useCustom && (
                                                                <Button
                                                                    onClick={() => handleSaveExchangeRate(currency)}
                                                                    className="w-full h-8 text-xs"
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    {t("settings.exchange.saveRate", { currency })}
                                                                </Button>
                                                            )}
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

                {/* AI 설정 */}
                <Collapsible defaultOpen={false}>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-3 pb-1">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="flex items-center gap-1.5 text-base">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    AI 자동 생성 설정
                                </CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="px-3 pb-3 space-y-3">
                                {/* 기본 모드 안내 */}
                                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
                                    <p className="text-xs font-semibold text-primary">✓ AI 자동 생성 사용 가능</p>
                                    <p className="text-xs text-muted-foreground">
                                        별도 설정 없이 체크리스트·장소·일정을 AI로 자동 생성할 수 있습니다.
                                    </p>
                                </div>

                                {/* 고급: 개인 API 키 */}
                                <Collapsible defaultOpen={false}>
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1">
                                            <Key className="w-3.5 h-3.5" />
                                            <span>고급: 개인 API 키 사용</span>
                                            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="space-y-2 pt-2 border-t mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                개인 Gemini API 키를 입력하면 기본 서버 대신 직접 호출합니다.{" "}
                                                <a
                                                    href="https://aistudio.google.com/app/apikey"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary underline"
                                                >
                                                    API 키 발급 →
                                                </a>
                                            </p>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        type={showGeminiKey ? "text" : "password"}
                                                        value={geminiApiKeyInput}
                                                        onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                                                        placeholder="AIza... (비워두면 기본 서버 사용)"
                                                        className="h-9 text-xs pr-9 font-mono"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowGeminiKey((v) => !v)}
                                                    >
                                                        {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="h-9 text-xs shrink-0"
                                                    onClick={() => {
                                                        if (geminiApiKeyInput.trim()) {
                                                            saveGeminiApiKey(geminiApiKeyInput.trim());
                                                            setGeminiApiKey(geminiApiKeyInput.trim());
                                                            toast.success("개인 API 키가 저장되었습니다.");
                                                        } else {
                                                            clearGeminiApiKey();
                                                            setGeminiApiKey("");
                                                            toast.success("개인 API 키가 삭제되었습니다. 기본 서버를 사용합니다.");
                                                        }
                                                    }}
                                                >
                                                    저장
                                                </Button>
                                            </div>
                                            {geminiApiKey && (
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    ✓ 개인 API 키 사용 중
                                                </p>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Collapsible defaultOpen={false}>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-3 pb-1">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="text-base text-left">{t("language.card.title")}</CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="px-3 pb-3 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    {t("language.card.description")}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["ko", "en"] as const).map((option) => (
                                        <Button
                                            key={option}
                                            type="button"
                                            size="sm"
                                            variant={language === option ? "default" : "outline"}
                                            onClick={() => setLanguage(option as AppLanguage)}
                                            className="h-8 text-xs"
                                        >
                                            {LANGUAGE_LABELS[option]}
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("language.current", { language: LANGUAGE_LABELS[language] })}
                                </p>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Collapsible defaultOpen={false}>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-3 pb-1">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="text-base text-left">{t("settings.fontScale.title")}</CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="px-3 pb-3 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    {t("settings.fontScale.description")}
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                    {FONT_SCALE_LEVELS.map((level) => (
                                        <Button
                                            key={level}
                                            type="button"
                                            size="sm"
                                            variant={fontScaleOption === level ? "default" : "outline"}
                                            onClick={() => handleFontScaleChange(level)}
                                            className="h-8 text-xs"
                                        >
                                            {level}
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("settings.fontScale.current", { level: fontScaleOption })}
                                </p>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* 데이터 관리 */}
                <Collapsible defaultOpen={false}>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-3 pb-1">
                            <CollapsibleTrigger className="w-full">
                                <CardTitle className="flex items-center gap-1.5 text-base">
                                    <Download className="w-4 h-4 text-primary" />
                                    {t("settings.data.title")}
                                </CardTitle>
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="px-3 pb-3 space-y-2">
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                        {t("settings.data.description")}
                                    </p>
                                </div>

                                {/* 전체 데이터 내보내기/가져오기 */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">{t("settings.data.all")}</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleExportData}
                                            variant="outline"
                                            className="flex-1 h-8 gap-1 text-xs px-2"
                                            disabled={!selectedTripId}
                                            size="sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t("settings.data.exportAll")}
                                        </Button>
                                        <Button
                                            onClick={handleImportData}
                                            variant="outline"
                                            className="flex-1 h-8 gap-1 text-xs px-2"
                                            size="sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {t("settings.data.importAll")}
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* 섹션별 데이터 관리 */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">{t("settings.data.section")}</Label>

                                    {/* 일정 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.schedules")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("schedules")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("schedules")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 지출 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.expenses")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("expenses")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("expenses")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 장소 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.places")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("places")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("places")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 일기 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.diaries")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("diaries")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("diaries")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 메모 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.memos")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("memos")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("memos")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 체크리스트 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.checklists")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("checklists")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("checklists")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 예산 */}
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{t("settings.data.section.budgets")}</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleExportSection("budgets")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                disabled={!selectedTripId}
                                                size="sm"
                                            >
                                                <Download className="w-3 h-3" />
                                                {t("settings.data.export")}
                                            </Button>
                                            <Button
                                                onClick={() => handleImportSection("budgets")}
                                                variant="outline"
                                                className="flex-1 h-8 gap-1 text-xs px-2"
                                                size="sm"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {t("settings.data.import")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {t("settings.data.warning")}
                                </p>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Separator />

                {/* 앱 정보 */}
                <div className="text-center text-xs text-muted-foreground space-y-1">
                    <p>{t("settings.appInfo.version")}</p>
                    <p>{t("settings.appInfo.tagline")}</p>
                </div>
            </div>
        </>
    );
}

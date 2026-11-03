"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db, Trip } from "@/lib/db";
import { runDateNormalizationMigration } from "@/lib/dateMigration";
import { ensureDefaultSampleData } from "@/lib/seedData";

// Dexie db.ts의 Trip 인터페이스를 직접 활용하므로 기존 인터페이스는 삭제하거나 상속할 수 있습니다.
// 여기서는 `import { Trip }`을 사용합니다.

interface TripContextType {
    selectedTripId: string | null;
    selectedTrip: Trip | null;
    trips: Trip[];
    loading: boolean;
    setSelectedTripId: (tripId: string | null) => void;
    refreshTrips: () => Promise<void>;
    loadSampleData: (force?: boolean) => Promise<boolean>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const STORAGE_KEY = "hoju_selected_trip_id";

export function TripProvider({ children }: { children: React.ReactNode }) {
    const [selectedTripId, setSelectedTripIdState] = useState<string | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    // localStorage에서 선택된 trip_id 로드
    useEffect(() => {
        const savedTripId = localStorage.getItem(STORAGE_KEY);
        if (savedTripId) {
            setSelectedTripIdState(savedTripId);
        }
    }, []);

    // trip 목록 조회
    const fetchTrips = useCallback(async () => {
        console.log("fetchTrips 호출됨 (LocalDB)");
        try {
            console.log("Dexie에서 trip 목록 조회 시작");
            const data = await db.trips.orderBy("created_at").reverse().toArray();

            console.log("Dexie 조회 결과:", data.length, "개");

            if (data && data.length > 0) {
                // trip 목록 업데이트
                console.log("Trip 목록 업데이트:", data.length, "개", data.map(t => t.title));
                setTrips(data);
            } else {
                setTrips([]);
            }
        } catch (err) {
            console.error("Failed to fetch trips from Dexie:", err);
        } finally {
            setLoading(false);
        }
    }, []); // 의존성 없이 항상 동일한 함수 참조 유지

    // trip 목록이 로드되면 선택된 trip 설정
    useEffect(() => {
        // trips가 비어있다면 selection을 모두 초기화한다 (모든 trip 삭제 시).
        if (trips.length === 0) {
            if (selectedTrip !== null) setSelectedTrip(null);
            if (selectedTripId !== null) setSelectedTripIdState(null);
            // 다음 trip 생성 시 새 id가 저장되므로 STORAGE_KEY는 굳이 비우지 않는다.
            return;
        }

        const currentSelectedId = selectedTripId || localStorage.getItem(STORAGE_KEY);

        if (currentSelectedId) {
            const trip = trips.find(t => t.id === currentSelectedId);
            if (trip) {
                // settings에서 cities 같은 필드가 바뀌었을 수 있으므로 trip 객체는 항상 최신 값으로 동기화.
                setSelectedTrip(trip);
                if (!selectedTripId) setSelectedTripIdState(currentSelectedId);
                localStorage.setItem(STORAGE_KEY, currentSelectedId);
                return;
            }
            // 저장된 id가 더 이상 유효하지 않다 → localStorage 정리 후 첫 trip 폴백.
            localStorage.removeItem(STORAGE_KEY);
        }

        // 저장된 id가 없거나 무효이면 첫 trip을 선택한다.
        const firstTrip = trips[0];
        setSelectedTripIdState(firstTrip.id);
        setSelectedTrip(firstTrip);
        localStorage.setItem(STORAGE_KEY, firstTrip.id);
    }, [trips]); // trips만 의존성으로 사용

    // 선택된 trip_id 변경 시 trip 정보 업데이트
    useEffect(() => {
        if (!selectedTripId) {
            setSelectedTrip(null);
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        // 현재 선택된 trip이 이미 올바른 trip이면 스킵
        if (selectedTrip && selectedTrip.id === selectedTripId) {
            localStorage.setItem(STORAGE_KEY, selectedTripId);
            return;
        }

        // 목록에서 trip 찾기
        const trip = trips.find(t => t.id === selectedTripId);
        if (trip) {
            setSelectedTrip(trip);
            localStorage.setItem(STORAGE_KEY, selectedTripId);
            return;
        }

        // trips 자체가 아직 비어있는 초기 로드 시점에는 위 effect가 처리하므로 그냥 둔다.
        // 이미 trips에 데이터가 있는데도 못 찾는다면 무효 id이므로 정리한다.
        if (trips.length > 0) {
            localStorage.removeItem(STORAGE_KEY);
            const firstTrip = trips[0];
            setSelectedTripIdState(firstTrip.id);
            setSelectedTrip(firstTrip);
            localStorage.setItem(STORAGE_KEY, firstTrip.id);
        }
    }, [selectedTripId]); // selectedTripId만 의존성으로 사용

    // 초기 로드 (샘플 데이터 주입 및 옛 datetime 형식의 날짜 정규화 후 trip 목록 조회)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            await ensureDefaultSampleData();
            await runDateNormalizationMigration();
            if (!cancelled) await fetchTrips();
        })();
        return () => {
            cancelled = true;
        };
    }, [fetchTrips]);

    const setSelectedTripId = useCallback((tripId: string | null) => {
        setSelectedTripIdState(tripId);
    }, []);

    const refreshTrips = useCallback(async () => {
        console.log("refreshTrips 호출됨");
        // 강제로 목록 새로고침 (loading 상태 초기화)
        setLoading(true);
        await fetchTrips();
        console.log("refreshTrips 완료");
    }, [fetchTrips]);

    const loadSampleData = useCallback(async (force: boolean = true) => {
        setLoading(true);
        const success = await ensureDefaultSampleData(force);
        await fetchTrips();
        return success;
    }, [fetchTrips]);

    return (
        <TripContext.Provider
            value={{
                selectedTripId,
                selectedTrip,
                trips,
                loading,
                setSelectedTripId,
                refreshTrips,
                loadSampleData,
            }}
        >
            {children}
        </TripContext.Provider>
    );
}

export function useTrip() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error("useTrip must be used within a TripProvider");
    }
    return context;
}





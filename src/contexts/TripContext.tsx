"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Trip {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    family_count?: number;
    cities?: string;
    created_at?: string;
}

interface TripContextType {
    selectedTripId: string | null;
    selectedTrip: Trip | null;
    trips: Trip[];
    loading: boolean;
    setSelectedTripId: (tripId: string | null) => void;
    refreshTrips: () => Promise<void>;
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
        console.log("fetchTrips 호출됨");
        try {
            console.log("Supabase에서 trip 목록 조회 시작");
            const { data, error } = await supabase
                .from("trips")
                .select("*")
                .order("created_at", { ascending: false });

            console.log("Supabase 조회 결과:", { data: data?.length || 0, error });

            if (error) {
                console.error("Error fetching trips:", error);
                setLoading(false);
                return;
            }

            if (data) {
                // trip 목록 업데이트 (기존 목록을 새 목록으로 교체)
                console.log("Trip 목록 업데이트:", data.length, "개", data.map(t => t.title));
                setTrips(data);
            } else {
                // 데이터가 없으면 빈 배열로 설정
                console.log("Trip 데이터 없음, 빈 배열로 설정");
                setTrips([]);
            }
        } catch (err) {
            console.error("Failed to fetch trips:", err);
        } finally {
            setLoading(false);
        }
    }, []); // 의존성 없이 항상 동일한 함수 참조 유지

    // trip 목록이 로드되면 선택된 trip 설정
    useEffect(() => {
        if (trips.length === 0) return;
        
        const currentSelectedId = selectedTripId || localStorage.getItem(STORAGE_KEY);
        
        // 이미 선택된 trip이 있고 목록에 존재하면 유지 (재설정 방지)
        if (selectedTrip && trips.find(t => t.id === selectedTrip.id)) {
            return; // 이미 올바른 trip이 선택되어 있음
        }
        
        // 선택된 trip ID가 있으면 해당 trip 찾기
        if (currentSelectedId) {
            const trip = trips.find(t => t.id === currentSelectedId);
            if (trip) {
                // 선택된 trip 업데이트
                setSelectedTrip(trip);
                if (!selectedTripId) {
                    setSelectedTripIdState(currentSelectedId);
                }
                localStorage.setItem(STORAGE_KEY, currentSelectedId);
                return;
            }
        }
        
        // 저장된 trip_id가 없거나 유효하지 않으면 첫 번째 trip 선택 (초기 로드 시에만)
        if (trips.length > 0 && !selectedTrip && !selectedTripId && !localStorage.getItem(STORAGE_KEY)) {
            const firstTrip = trips[0];
            setSelectedTripIdState(firstTrip.id);
            setSelectedTrip(firstTrip);
            localStorage.setItem(STORAGE_KEY, firstTrip.id);
        }
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
        } else if (trips.length > 0) {
            // 선택된 trip_id에 해당하는 trip이 목록에 없으면 목록 새로고침
            fetchTrips();
        }
    }, [selectedTripId]); // selectedTripId만 의존성으로 사용

    // 초기 로드
    useEffect(() => {
        fetchTrips();
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

    return (
        <TripContext.Provider
            value={{
                selectedTripId,
                selectedTrip,
                trips,
                loading,
                setSelectedTripId,
                refreshTrips,
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





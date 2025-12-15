"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Plane, Users, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

    // 여행 설정 상태
    const [tripTitle, setTripTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [familyCount, setFamilyCount] = useState(4);
    const [cities, setCities] = useState("");

    // Supabase에서 여행 설정 로드
    useEffect(() => {
        async function loadSettings() {
            try {
                const { data, error } = await supabase
                    .from("trips")
                    .select("*")
                    .limit(1)
                    .single();

                if (error && error.code !== "PGRST116") {
                    console.error("Error loading settings:", error);
                }

                if (data) {
                    setTripId(data.id);
                    setTripTitle(data.title || "");
                    setStartDate(data.start_date || "");
                    setEndDate(data.end_date || "");
                    setFamilyCount(data.family_count || 4);
                    setCities(data.cities || "");
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const tripData = {
                title: tripTitle,
                start_date: startDate,
                end_date: endDate,
                family_count: familyCount,
                cities: cities,
            };

            if (tripId) {
                // 기존 여행 정보 업데이트
                const { error } = await supabase
                    .from("trips")
                    .update(tripData)
                    .eq("id", tripId);

                if (error) throw error;
            } else {
                // 새 여행 정보 생성
                const { data, error } = await supabase
                    .from("trips")
                    .insert([tripData])
                    .select()
                    .single();

                if (error) throw error;
                if (data) setTripId(data.id);
            }

            alert("설정이 저장되었습니다! ✅");
        } catch (err: any) {
            const errorMessage = err?.message || err?.code || JSON.stringify(err);
            console.error("Failed to save settings:", errorMessage, err);
            alert(`저장 중 오류가 발생했습니다: ${errorMessage}`);
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
        <div className="p-4 pb-24 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-2xl font-bold">여행 설정</h1>
            </div>

            {/* 여행 기본 정보 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Plane className="w-5 h-5 text-primary" />
                        여행 정보
                    </CardTitle>
                </CardHeader>
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
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">귀국일</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 여행 구성원 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-primary" />
                        여행 구성원
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="familyCount">인원 수</Label>
                        <Input
                            id="familyCount"
                            type="number"
                            min={1}
                            max={20}
                            value={familyCount}
                            onChange={(e) => setFamilyCount(Number(e.target.value))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 방문 도시 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        방문 도시
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cities">도시 목록 (쉼표로 구분)</Label>
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
            </Card>

            {/* 저장 버튼 */}
            <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "저장 중..." : "설정 저장"}
            </Button>

            <Separator />

            {/* 앱 정보 */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>FamilyTrip.OS v1.0</p>
                <p>한달 가족여행 전용 운영 시스템</p>
            </div>
        </div>
    );
}

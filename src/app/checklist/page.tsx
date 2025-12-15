"use client";

import { useState } from "react";
import { ChecklistGroup, ChecklistGroupData } from "@/components/checklist/ChecklistGroup";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const INITIAL_DATA: ChecklistGroupData[] = [
    {
        title: "출발 전 (Before Departure)",
        items: [
            { id: "1", label: "여권 (유효기간 확인)", checked: false },
            { id: "2", label: "호주 비자 (ETA) 승인 확인", checked: true },
            { id: "3", label: "여행자 보험 가입", checked: true },
            { id: "4", label: "환전 / 트래블카드 충전", checked: false },
            { id: "5", label: "상비약 (해열제, 소화제 등)", checked: false },
        ],
    },
    {
        title: "숙소 이동 시 (Before Moving)",
        items: [
            { id: "6", label: "충전기 / 멀티탭 챙기기", checked: false },
            { id: "7", label: "세면도구 빠진 것 없나 확인", checked: false },
            { id: "8", label: "아이 애착인형 🧸", checked: false },
            { id: "9", label: "냉장고 음식 처리", checked: false },
        ],
    },
];

export default function ChecklistPage() {
    const [groups, setGroups] = useState(INITIAL_DATA);

    const handleToggle = (itemId: string, checked: boolean) => {
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                items: g.items.map((i) => i.id === itemId ? { ...i, checked } : i)
            }))
        );
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-2xl font-bold">체크리스트</h1>
            </div>

            {groups.map((group) => (
                <ChecklistGroup
                    key={group.title}
                    group={group}
                    onToggle={handleToggle}
                />
            ))}
        </div>
    );
}

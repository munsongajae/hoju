"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ExternalLink, Baby } from "lucide-react";
import Link from "next/link";

export type PlaceCategory = "tour" | "food" | "shop" | "medical" | "play" | "museum";

export interface PlaceData {
    id: string;
    name: string;
    category: PlaceCategory;
    rating?: number; // 1-5
    isKidFriendly: boolean;
    notes: string;
    googleMapUrl?: string;
}

interface PlaceCardProps {
    place: PlaceData;
    onClick?: () => void;
}

const categoryColors: Record<PlaceCategory, string> = {
    tour: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    shop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    medical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    play: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    museum: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const categoryLabels: Record<PlaceCategory, string> = {
    tour: "관광",
    food: "맛집",
    shop: "쇼핑",
    medical: "병원/약국",
    play: "놀이터/키즈",
    museum: "전시",
};

export function PlaceCard({ place, onClick }: PlaceCardProps) {
    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            onClick={onClick}
        >
            <CardContent className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={categoryColors[place.category]}>
                        {categoryLabels[place.category]}
                    </Badge>
                    <div className="space-y-1">
                        <h3 className="font-bold text-base leading-none">{place.name}</h3>
                        {place.isKidFriendly && (
                            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                                <Baby className="w-3 h-3 mr-0.5" />
                                <span className="text-[10px]">아이 추천</span>
                            </div>
                        )}
                    </div>
                </div>

                {place.rating && (
                    <div className="flex items-center text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-xs">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {place.rating}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

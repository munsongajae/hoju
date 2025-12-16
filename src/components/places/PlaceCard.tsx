"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ExternalLink, Baby, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type PlaceCategory = "tour" | "food" | "shop" | "medical" | "play" | "museum" | "market";

export interface PlaceData {
    id: string;
    name: string;
    category: PlaceCategory;
    city?: string; // "시드니" | "멜버른"
    rating?: number; // 1-5
    isKidFriendly: boolean;
    notes: string;
    googleMapUrl?: string;
    isFavorite?: boolean;
    operatingHours?: string;
    contactPhone?: string;
    websiteUrl?: string;
    address?: string;
    visitCount?: number;
    lat?: number;
    lng?: number;
}

interface PlaceCardProps {
    place: PlaceData;
    onClick?: () => void;
    onFavoriteToggle?: () => void;
}

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
    tour: "관광",
    food: "맛집",
    shop: "쇼핑",
    medical: "병원/약국",
    play: "놀이터/키즈",
    museum: "전시",
    market: "시장",
};

export function PlaceCard({ place, onClick, onFavoriteToggle }: PlaceCardProps) {
    const [isFavorite, setIsFavorite] = useState(place.isFavorite || false);
    const [isToggling, setIsToggling] = useState(false);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isToggling) return;

        setIsToggling(true);
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);

        try {
            const { error } = await supabase
                .from('places')
                .update({ is_favorite: newFavoriteState })
                .eq('id', place.id);

            if (error) {
                setIsFavorite(!newFavoriteState); // Revert on error
                throw error;
            }
            onFavoriteToggle?.();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 relative"
            onClick={onClick}
        >
            <CardContent className="px-3 py-1.5 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                    <Badge variant="secondary" className={`mt-0.5 px-1.5 py-0 text-[10px] h-5 ${categoryColors[place.category]}`}>
                        {categoryLabels[place.category]}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-bold text-sm leading-tight break-keep">{place.name}</h3>
                        {place.isKidFriendly && (
                            <Baby className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {place.rating && (
                        <div className="flex items-center text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-[10px]">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            {place.rating}
                        </div>
                    )}
                    <button
                        onClick={handleFavoriteClick}
                        className={`p-1 rounded transition-colors ${isFavorite
                                ? "text-red-500 hover:text-red-600"
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                        disabled={isToggling}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

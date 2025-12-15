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
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <Badge variant="secondary" className={categoryColors[place.category]}>
                            {categoryLabels[place.category]}
                        </Badge>
                    </div>
                    {place.rating && (
                        <div className="flex items-center text-amber-500 text-sm font-medium">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" />
                            {place.rating}
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-lg leading-tight">{place.name}</h3>

                {place.isKidFriendly && (
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">
                        <Baby className="w-3 h-3" />
                        아이 추천
                    </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {place.notes}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                {place.googleMapUrl && (
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-2" asChild>
                        <Link href={place.googleMapUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                            Google Map
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

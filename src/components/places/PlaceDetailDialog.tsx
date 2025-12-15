"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Baby, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { PlaceData, PlaceCategory } from "@/components/places/PlaceCard";

interface PlaceDetailDialogProps {
    place: PlaceData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (place: PlaceData) => void;
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

export function PlaceDetailDialog({ place, open, onOpenChange, onEdit }: PlaceDetailDialogProps) {
    if (!place) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={categoryColors[place.category]}>
                            {categoryLabels[place.category]}
                        </Badge>
                        {place.rating && (
                            <div className="flex items-center text-amber-500 text-sm font-medium">
                                <Star className="w-4 h-4 fill-current mr-1" />
                                {place.rating}
                            </div>
                        )}
                    </div>
                    <DialogTitle className="text-xl">{place.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {place.isKidFriendly && (
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full dark:bg-green-900/20 dark:text-green-400">
                            <Baby className="w-4 h-4" />
                            아이와 함께하기 좋아요
                        </div>
                    )}

                    <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                        {place.notes || "메모가 없습니다."}
                    </div>

                    {place.googleMapUrl && (
                        <Button variant="outline" className="w-full gap-2" asChild>
                            <Link href={place.googleMapUrl} target="_blank" rel="noopener noreferrer">
                                <MapPin className="w-4 h-4 text-primary" />
                                Google Map에서 보기
                            </Link>
                        </Button>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        닫기
                    </Button>
                    <Button onClick={() => {
                        onOpenChange(false);
                        onEdit(place);
                    }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        수정
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

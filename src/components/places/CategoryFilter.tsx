"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlaceCategory } from "./PlaceCard";

const LABELS: Record<string, string> = {
    all: "전체",
    tour: "관광",
    food: "맛집",
    shop: "쇼핑",
    medical: "의료",
    play: "놀이",
    museum: "전시",
    market: "시장",
};

export function CategoryFilter({
    categories,
    categoryCounts,
    selectedCategory,
    onSelectCategory,
}: {
    categories: PlaceCategory[];
    categoryCounts?: Record<string, number>;
    selectedCategory: PlaceCategory | "all";
    onSelectCategory: (category: PlaceCategory | "all") => void;
}) {
    const totalCount = categoryCounts ? Object.values(categoryCounts).reduce((a, b) => a + b, 0) : 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedCategory === "all" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onSelectCategory("all")}
                    className="rounded-full text-xs h-7 px-3"
                >
                    전체{categoryCounts && ` (${totalCount})`}
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onSelectCategory(cat)}
                        className={cn("rounded-full text-xs h-7 px-3", selectedCategory === cat && "bg-secondary text-secondary-foreground hover:bg-secondary/80")}
                    >
                        {LABELS[cat]}{categoryCounts && categoryCounts[cat] !== undefined && ` (${categoryCounts[cat]})`}
                    </Button>
                ))}
            </div>
        </div>
    );
}

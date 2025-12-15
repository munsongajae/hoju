"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlaceCategory } from "./PlaceCard";

interface CategoryFilterProps {
    categories: PlaceCategory[];
    categoryCounts?: Record<string, number>;
    selectedCategory: PlaceCategory | "all";
    onSelectCategory: (category: PlaceCategory | "all") => void;
    showKidFriendlyOnly: boolean;
    onToggleKidFriendly: () => void;
}

const LABELS: Record<string, string> = {
    all: "전체",
    tour: "관광",
    food: "맛집",
    shop: "쇼핑",
    medical: "의료",
    play: "놀이",
    museum: "전시",
};

export function CategoryFilter({
    categories,
    categoryCounts,
    selectedCategory,
    onSelectCategory,
    showKidFriendlyOnly,
    onToggleKidFriendly,
}: CategoryFilterProps) {
    const totalCount = categoryCounts ? Object.values(categoryCounts).reduce((a, b) => a + b, 0) : 0;
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectCategory("all")}
                    className="rounded-full text-xs h-7 px-3"
                >
                    전체{categoryCounts && ` (${totalCount})`}
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectCategory(cat)}
                        className="rounded-full text-xs h-7 px-3"
                    >
                        {LABELS[cat]}{categoryCounts && categoryCounts[cat] !== undefined && ` (${categoryCounts[cat]})`}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleKidFriendly}
                    className={cn(
                        "text-xs flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors",
                        showKidFriendlyOnly
                            ? "bg-green-50 border-green-200 text-green-700 font-medium dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                            : "bg-background border-border text-muted-foreground"
                    )}
                >
                    <span className={cn("w-3 h-3 rounded-full border", showKidFriendlyOnly ? "bg-green-500 border-green-500" : "border-muted-foreground")} />
                    아이 동반 추천만 보기
                </button>
            </div>
        </div>
    );
}

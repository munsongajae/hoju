"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CityChipFilter({
    cities,
    selectedCity,
    allLabel,
    onSelectCity,
}: {
    cities: string[];
    selectedCity: string | "all";
    allLabel: string;
    onSelectCity: (next: string | "all") => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={selectedCity === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCity("all")}
                className={cn(
                    "rounded-full text-xs h-7 px-3",
                    selectedCity === "all" && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
            >
                {allLabel}
            </Button>
            {cities.map((city) => (
                <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectCity(city)}
                    className={cn(
                        "rounded-full text-xs h-7 px-3",
                        selectedCity === city && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {city}
                </Button>
            ))}
        </div>
    );
}


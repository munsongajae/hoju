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
    onSelectCity: (city: string | "all") => void;
}) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap w-full pb-1">
            <Button
                variant={selectedCity === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCity("all")}
                className={cn(
                    "rounded-full text-xs h-7 px-3 flex-shrink-0",
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
                        "rounded-full text-xs h-7 px-3 flex-shrink-0",
                        selectedCity === city && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {city}
                </Button>
            ))}
        </div>
    );
}


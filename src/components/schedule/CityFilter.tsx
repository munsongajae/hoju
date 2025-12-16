"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CityFilterProps {
    cities: string[];
    selectedCity: string;
    onSelectCity: (city: string) => void;
}

export function CityFilter({ cities, selectedCity, onSelectCity }: CityFilterProps) {
    return (
        <Tabs value={selectedCity} onValueChange={onSelectCity} className="w-full">
            <TabsList className="w-full grid h-8" style={{ gridTemplateColumns: `repeat(${cities.length}, minmax(0, 1fr))` }}>
                {cities.map((city) => (
                    <TabsTrigger key={city} value={city} className="text-xs sm:text-sm">
                        {city}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}

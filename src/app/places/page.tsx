"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

const CATEGORIES: PlaceCategory[] = ["tour", "food", "play", "shop", "museum", "medical", "market"];

export default function PlacesPage() {
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
    const [selectedCity, setSelectedCity] = useState("전체");
    const [showKidFriendlyOnly, setShowKidFriendlyOnly] = useState(false);

    // Detail Dialog State
    const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Edit Dialog State
    const [editingPlace, setEditingPlace] = useState<PlaceData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchPlaces = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*');

            if (error) {
                console.error('Error fetching places:', error);
            } else if (data) {
                const formattedData: PlaceData[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    city: item.city || "시드니",
                    rating: item.rating,
                    isKidFriendly: item.is_kid_friendly,
                    notes: item.notes,
                    googleMapUrl: item.google_map_url,
                }));
                // Sort by creation or name if needed, but Supabase default order is usually ID
                setPlaces(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    // Filter by City first to calculate counts correctly for the city
    const placesByCity = places.filter((place) => {
        if (selectedCity === "전체") return true;
        return place.city === selectedCity;
    });

    const filteredPlaces = placesByCity.filter((place) => {
        const catMatch = selectedCategory === "all" || place.category === selectedCategory;
        const kidMatch = !showKidFriendlyOnly || place.isKidFriendly;
        return catMatch && kidMatch;
    });

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedCity, showKidFriendlyOnly]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
    const paginatedPlaces = filteredPlaces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Calculate category counts based on current city
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        placesByCity.forEach((place) => {
            counts[place.category] = (counts[place.category] || 0) + 1;
        });
        return counts;
    }, [placesByCity]);

    return (
        <div className="pb-24 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">장소 보관함</h1>
                <AddPlaceDialog onPlaceAdded={fetchPlaces} />
            </div>

            <CategoryFilter
                categories={CATEGORIES}
                categoryCounts={categoryCounts}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                showKidFriendlyOnly={showKidFriendlyOnly}
                onToggleKidFriendly={() => setShowKidFriendlyOnly(!showKidFriendlyOnly)}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {paginatedPlaces.map((place) => (
                            <PlaceCard
                                key={place.id}
                                place={place}
                                onClick={() => {
                                    setSelectedPlace(place);
                                    setDetailDialogOpen(true);
                                }}
                            />
                        ))}
                    </div>

                    {filteredPlaces.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            조건에 맞는 장소가 없습니다.
                        </div>
                    ) : (
                        totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    이전
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    다음
                                </Button>
                            </div>
                        )
                    )}
                </div>
            )}

            <PlaceDetailDialog
                place={selectedPlace}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                onEdit={(place) => {
                    setEditingPlace(place);
                    setEditDialogOpen(true);
                }}
            />

            <EditPlaceDialog
                place={editingPlace}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onPlaceUpdated={fetchPlaces}
            />
        </div>
    );
}

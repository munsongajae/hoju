"use client";

import { useState, useEffect, useMemo } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

const CATEGORIES: PlaceCategory[] = ["tour", "food", "play", "shop", "museum", "medical"];

export default function PlacesPage() {
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
    const [showKidFriendlyOnly, setShowKidFriendlyOnly] = useState(false);

    // Detail Dialog State
    const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Edit Dialog State
    const [editingPlace, setEditingPlace] = useState<PlaceData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchPlaces();
    }, []);

    async function fetchPlaces() {
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
                    rating: item.rating,
                    isKidFriendly: item.is_kid_friendly,
                    notes: item.notes,
                    googleMapUrl: item.google_map_url,
                }));
                setPlaces(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredPlaces = places.filter((place) => {
        const catMatch = selectedCategory === "all" || place.category === selectedCategory;
        const kidMatch = !showKidFriendlyOnly || place.isKidFriendly;
        return catMatch && kidMatch;
    });

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        places.forEach((place) => {
            counts[place.category] = (counts[place.category] || 0) + 1;
        });
        return counts;
    }, [places]);

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
                showKidFriendlyOnly={showKidFriendlyOnly}
                onToggleKidFriendly={() => setShowKidFriendlyOnly(!showKidFriendlyOnly)}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredPlaces.map((place) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            onClick={() => {
                                setSelectedPlace(place);
                                setDetailDialogOpen(true);
                            }}
                        />
                    ))}
                    {filteredPlaces.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            조건에 맞는 장소가 없습니다.
                        </div>
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

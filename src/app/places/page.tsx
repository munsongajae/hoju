"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Loader2, Search, ArrowUpDown, Heart, Sparkles, Map, List } from "lucide-react";
import dynamic from "next/dynamic";

const PlaceMap = dynamic(() => import("@/components/places/PlaceMap"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/lib/supabase";
import { useTrip } from "@/contexts/TripContext";

const CATEGORIES: PlaceCategory[] = ["tour", "food", "play", "shop", "museum", "medical", "market"];

export default function PlacesPage() {
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "rating" | "newest">("newest");
    const [activeTab, setActiveTab] = useState<"all" | "sydney" | "melbourne" | "favorites">("all");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");

    // Detail Dialog State
    const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Edit Dialog State
    const [editingPlace, setEditingPlace] = useState<PlaceData | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { selectedTripId } = useTrip();

    const fetchPlaces = useCallback(async () => {
        if (!selectedTripId) {
            setLoading(false);
            setPlaces([]);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('trip_id', selectedTripId);

            if (error) {
                console.error('Error fetching places:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                });
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
                    isFavorite: item.is_favorite || false,
                    address: item.address,
                    operatingHours: item.operating_hours,
                    contactPhone: item.contact_phone,
                    websiteUrl: item.website_url,
                    visitCount: item.visit_count || 0,
                    lat: item.lat,
                    lng: item.lng,
                }));
                setPlaces(formattedData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedTripId]);

    useEffect(() => {
        if (selectedTripId) {
            fetchPlaces();
        }
    }, [selectedTripId, fetchPlaces]);

    // Derived State for Filtering
    const filteredPlaces = useMemo(() => {
        let filtered = places.filter((place) => {
            // 1. Tab Filter
            if (activeTab === "sydney" && place.city !== "시드니") return false;
            if (activeTab === "melbourne" && place.city !== "멜버른") return false;
            if (activeTab === "favorites" && !place.isFavorite) return false;

            // 2. Category Filter
            if (selectedCategory !== "all" && place.category !== selectedCategory) return false;

            // 3. Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return place.name.toLowerCase().includes(query) ||
                    place.category.toLowerCase().includes(query);
            }

            return true;
        });

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name, "ko");
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "newest":
                default:
                    return 0; // ID based sort (default)
            }
        });

        return filtered;
    }, [places, activeTab, selectedCategory, searchQuery, sortBy]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedCategory, searchQuery, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
    const paginatedPlaces = filteredPlaces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Calculate category counts for the CURRENT VIEW (based on activeTab)
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        // Filter based on TAB first to show relevant counts
        const tabFilteredPlaces = places.filter(place => {
            if (activeTab === "sydney") return place.city === "시드니";
            if (activeTab === "melbourne") return place.city === "멜버른";
            if (activeTab === "favorites") return place.isFavorite;
            return true;
        });

        tabFilteredPlaces.forEach((place) => {
            counts[place.category] = (counts[place.category] || 0) + 1;
        });
        return counts;
    }, [places, activeTab]);

    return (
        <div className="pb-24 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">장소 보관함</h1>
                <AddPlaceDialog onPlaceAdded={fetchPlaces} />
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="sydney">시드니</TabsTrigger>
                    <TabsTrigger value="melbourne">멜버른</TabsTrigger>
                    <TabsTrigger value="favorites">
                        <Heart className="w-3 h-3 mr-1" />
                        즐겨찾기
                    </TabsTrigger>
                </TabsList>

                {/* Unified Content Area */}
                <div className="mt-4 space-y-4">
                    <CategoryFilter
                        categories={CATEGORIES}
                        categoryCounts={categoryCounts}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />

                    {/* Controls Row */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="장소 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-[130px]">
                                    <ArrowUpDown className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">최신순</SelectItem>
                                    <SelectItem value="name">이름순</SelectItem>
                                    <SelectItem value="rating">평점순</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="bg-muted p-1 rounded-lg flex gap-1 shrink-0">
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "map" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("map")}
                                >
                                    <Map className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Display */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {viewMode === "map" ? (
                                <PlaceMap places={filteredPlaces} />
                            ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {paginatedPlaces.map((place) => (
                                        <PlaceCard
                                            key={place.id}
                                            place={place}
                                            onClick={() => {
                                                setSelectedPlace(place);
                                                setDetailDialogOpen(true);
                                            }}
                                            onFavoriteToggle={fetchPlaces}
                                        />
                                    ))}
                                </div>
                            )}

                            {filteredPlaces.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                                    <div className="mb-2">검색 결과가 없습니다.</div>
                                    <Button variant="link" size="sm" onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("all");
                                    }}>
                                        조건 초기화
                                    </Button>
                                </div>
                            )}

                            {/* Pagination (List Mode Only) */}
                            {totalPages > 1 && viewMode === "list" && (
                                <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        이전
                                    </Button>
                                    <span className="text-sm font-medium">
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
                            )}
                        </div>
                    )}
                </div>
            </Tabs>


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
        </div >
    );
}

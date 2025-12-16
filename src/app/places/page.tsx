"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Loader2, Search, ArrowUpDown, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/lib/supabase";

const CATEGORIES: PlaceCategory[] = ["tour", "food", "play", "shop", "museum", "medical", "market"];

export default function PlacesPage() {
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
    const [selectedCity, setSelectedCity] = useState("전체");
    const [showKidFriendlyOnly, setShowKidFriendlyOnly] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "rating" | "newest">("newest");
    const [activeTab, setActiveTab] = useState<"all" | "favorites" | "recommended">("all");

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
                    isFavorite: item.is_favorite || false,
                    address: item.address,
                    operatingHours: item.operating_hours,
                    contactPhone: item.contact_phone,
                    websiteUrl: item.website_url,
                    visitCount: item.visit_count || 0,
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

    // 추천 장소 계산
    const recommendedPlaces = useMemo(() => {
        // 평점이 높고 방문 횟수가 많은 장소 우선
        return [...placesByCity]
            .filter(p => p.rating && p.rating >= 4)
            .sort((a, b) => {
                const aScore = (a.rating || 0) * 10 + (a.visitCount || 0);
                const bScore = (b.rating || 0) * 10 + (b.visitCount || 0);
                return bScore - aScore;
            })
            .slice(0, 5);
    }, [placesByCity]);

    // 카테고리별 추천 장소
    const categoryRecommendedPlaces = useMemo(() => {
        const categoryMap: Record<string, PlaceData[]> = {};
        placesByCity.forEach(place => {
            if (!categoryMap[place.category]) {
                categoryMap[place.category] = [];
            }
            categoryMap[place.category].push(place);
        });

        const result: Record<string, PlaceData[]> = {};
        Object.keys(categoryMap).forEach(cat => {
            result[cat] = categoryMap[cat]
                .filter(p => p.rating && p.rating >= 4)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3);
        });
        return result;
    }, [placesByCity]);

    const filteredPlaces = useMemo(() => {
        let filtered = placesByCity.filter((place) => {
            const catMatch = selectedCategory === "all" || place.category === selectedCategory;
            const kidMatch = !showKidFriendlyOnly || place.isKidFriendly;
            const favoriteMatch = !showFavoritesOnly || place.isFavorite;
            const searchMatch = !searchQuery || 
                place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.category.toLowerCase().includes(searchQuery.toLowerCase());
            return catMatch && kidMatch && favoriteMatch && searchMatch;
        });

        // 정렬 적용
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name, "ko");
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "newest":
                default:
                    return 0; // ID 기반 정렬은 유지
            }
        });

        return filtered;
    }, [placesByCity, selectedCategory, showKidFriendlyOnly, showFavoritesOnly, searchQuery, sortBy]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedCity, showKidFriendlyOnly, showFavoritesOnly, searchQuery, sortBy, activeTab]);

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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites" | "recommended")}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="favorites">
                        <Heart className="w-4 h-4 mr-1" />
                        즐겨찾기
                    </TabsTrigger>
                    <TabsTrigger value="recommended">
                        <Sparkles className="w-4 h-4 mr-1" />
                        추천
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-4">
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

                    {/* 즐겨찾기 필터 */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={showFavoritesOnly ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        >
                            <Heart className={`w-4 h-4 mr-1 ${showFavoritesOnly ? "fill-current" : ""}`} />
                            즐겨찾기만
                        </Button>
                    </div>

                    {/* 검색 및 정렬 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="장소 이름 또는 카테고리로 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={sortBy} onValueChange={(value: "name" | "rating" | "newest") => setSortBy(value)}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="정렬 기준" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">최신순</SelectItem>
                                <SelectItem value="name">이름순</SelectItem>
                                <SelectItem value="rating">평점순</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                                        onFavoriteToggle={fetchPlaces}
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
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4 mt-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {placesByCity.filter(p => p.isFavorite).length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>즐겨찾기한 장소가 없습니다.</p>
                                    <p className="text-sm">장소 카드의 하트 아이콘을 눌러 즐겨찾기에 추가하세요.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {placesByCity
                                        .filter(p => p.isFavorite)
                                        .map((place) => (
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
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="recommended" className="space-y-4 mt-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 인기 추천 장소 */}
                            {recommendedPlaces.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            인기 추천 장소
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {recommendedPlaces.map((place) => (
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
                                    </CardContent>
                                </Card>
                            )}

                            {/* 카테고리별 추천 */}
                            {Object.keys(categoryRecommendedPlaces).map((category) => {
                                const places = categoryRecommendedPlaces[category];
                                if (places.length === 0) return null;

                                const categoryLabels: Record<string, string> = {
                                    tour: "관광",
                                    food: "맛집",
                                    shop: "쇼핑",
                                    medical: "병원/약국",
                                    play: "놀이터/키즈",
                                    museum: "전시",
                                    market: "시장",
                                };

                                return (
                                    <Card key={category}>
                                        <CardHeader>
                                            <CardTitle>{categoryLabels[category] || category} 추천</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {places.map((place) => (
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
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {recommendedPlaces.length === 0 && Object.keys(categoryRecommendedPlaces).length === 0 && (
                                <div className="text-center py-20 text-muted-foreground">
                                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>추천할 장소가 없습니다.</p>
                                    <p className="text-sm">평점 4점 이상의 장소가 추천됩니다.</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
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
        </div>
    );
}

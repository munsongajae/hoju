"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { Loader2, Search, ArrowUpDown, Heart, Sparkles, Map, List, ExternalLink, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const PlaceMap = dynamic(() => import("@/components/places/PlaceMap"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    // Google Map Links Dialog State
    const [googleMapDialogOpen, setGoogleMapDialogOpen] = useState(false);
    const [googleMapLinks, setGoogleMapLinks] = useState<Array<{ id: string; title: string; url: string; city?: string }>>([]);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [newLinkCity, setNewLinkCity] = useState("시드니");
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [editLinkTitle, setEditLinkTitle] = useState("");
    const [editLinkUrl, setEditLinkUrl] = useState("");
    const [editLinkCity, setEditLinkCity] = useState("시드니");
    const [selectedCityFilter, setSelectedCityFilter] = useState<"all" | "시드니" | "멜버른">("all");

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
            fetchGoogleMapLinks();
        }
    }, [selectedTripId, fetchPlaces]);

    // 구글맵 링크 불러오기
    const fetchGoogleMapLinks = useCallback(async () => {
        if (!selectedTripId) {
            setGoogleMapLinks([]);
            return;
        }

        try {
            setLoadingLinks(true);
            const { data, error } = await supabase
                .from('google_map_links')
                .select('*')
                .eq('trip_id', selectedTripId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching google map links:', error);
                return;
            }

            setGoogleMapLinks(data || []);
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoadingLinks(false);
        }
    }, [selectedTripId]);

    // 구글맵 링크 추가
    const handleAddGoogleMapLink = async () => {
        if (!selectedTripId) {
            alert("여행을 선택해주세요.");
            return;
        }

        if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
            alert("제목과 링크를 모두 입력해주세요.");
            return;
        }

        try {
            const { error } = await supabase
                .from('google_map_links')
                .insert([{
                    trip_id: selectedTripId,
                    title: newLinkTitle.trim(),
                    url: newLinkUrl.trim(),
                    city: newLinkCity,
                }]);

            if (error) throw error;

            setNewLinkTitle("");
            setNewLinkUrl("");
            setNewLinkCity("시드니");
            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error adding google map link:', err);
            alert(`링크 추가 실패: ${err?.message || "알 수 없는 오류"}`);
        }
    };

    // 구글맵 링크 수정 시작
    const handleStartEditLink = (link: { id: string; title: string; url: string; city?: string }) => {
        setEditingLinkId(link.id);
        setEditLinkTitle(link.title);
        setEditLinkUrl(link.url);
        setEditLinkCity(link.city || "시드니");
    };

    // 구글맵 링크 수정 취소
    const handleCancelEditLink = () => {
        setEditingLinkId(null);
        setEditLinkTitle("");
        setEditLinkUrl("");
        setEditLinkCity("시드니");
    };

    // 구글맵 링크 수정 완료
    const handleUpdateGoogleMapLink = async () => {
        if (!editingLinkId) return;

        if (!editLinkTitle.trim() || !editLinkUrl.trim()) {
            alert("제목과 링크를 모두 입력해주세요.");
            return;
        }

        try {
            const { error } = await supabase
                .from('google_map_links')
                .update({
                    title: editLinkTitle.trim(),
                    url: editLinkUrl.trim(),
                    city: editLinkCity,
                })
                .eq('id', editingLinkId);

            if (error) throw error;

            handleCancelEditLink();
            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error updating google map link:', err);
            alert(`링크 수정 실패: ${err?.message || "알 수 없는 오류"}`);
        }
    };

    // 구글맵 링크 삭제
    const handleDeleteGoogleMapLink = async (id: string) => {
        if (!confirm("이 링크를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('google_map_links')
                .delete()
                .eq('id', id);

            if (error) throw error;

            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error deleting google map link:', err);
            alert(`링크 삭제 실패: ${err?.message || "알 수 없는 오류"}`);
        }
    };

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

    // 도시별 필터링된 구글맵 링크
    const filteredGoogleMapLinks = useMemo(() => {
        if (selectedCityFilter === "all") {
            return googleMapLinks;
        }
        return googleMapLinks.filter(link => link.city === selectedCityFilter);
    }, [googleMapLinks, selectedCityFilter]);

    // 사용 가능한 도시 목록 (링크에 있는 도시들)
    const availableCities = useMemo(() => {
        const cities = new Set<string>();
        googleMapLinks.forEach(link => {
            if (link.city) {
                cities.add(link.city);
            }
        });
        return Array.from(cities).sort();
    }, [googleMapLinks]);


    return (
        <div className="pb-24 p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">장소 보관함</h1>
                <div className="flex items-center gap-2">
                    <Dialog open={googleMapDialogOpen} onOpenChange={setGoogleMapDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-full"
                                title="구글맵"
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                구글맵
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] !flex !flex-col overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle>구글맵</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
                                {/* 도시 필터 버튼 */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant={selectedCityFilter === "all" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCityFilter("all")}
                                        className="text-xs"
                                    >
                                        전체
                                    </Button>
                                    <Button
                                        variant={selectedCityFilter === "시드니" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCityFilter("시드니")}
                                        className="text-xs"
                                    >
                                        시드니
                                    </Button>
                                    <Button
                                        variant={selectedCityFilter === "멜버른" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCityFilter("멜버른")}
                                        className="text-xs"
                                    >
                                        멜버른
                                    </Button>
                                </div>

                                {/* 링크 추가 폼 */}
                                <div className="space-y-2 p-3 bg-muted rounded-lg">
                                    <Label className="text-sm font-semibold">새 링크 추가</Label>
                                    <Input
                                        placeholder="제목 (예: 스케이트보드 파크)"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={newLinkCity} onValueChange={setNewLinkCity}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="도시 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="시드니">시드니</SelectItem>
                                                <SelectItem value="멜버른">멜버른</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="구글맵 링크"
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAddGoogleMapLink}
                                        className="w-full"
                                        size="sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        추가하기
                                    </Button>
                                </div>

                                {/* 링크 리스트 */}
                                {loadingLinks ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredGoogleMapLinks.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Map className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>
                                            {selectedCityFilter === "all" 
                                                ? "구글맵 링크가 없습니다." 
                                                : `${selectedCityFilter}의 구글맵 링크가 없습니다.`}
                                        </p>
                                        <p className="text-sm mt-2">위에서 새 링크를 추가해주세요.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredGoogleMapLinks.map((link) => (
                                            <Card
                                                key={link.id}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors py-[5px]"
                                            >
                                                <CardContent className="py-1 px-3">
                                                    {editingLinkId === link.id ? (
                                                        // 수정 모드
                                                        <div className="space-y-2">
                                                            <Input
                                                                placeholder="제목"
                                                                value={editLinkTitle}
                                                                onChange={(e) => setEditLinkTitle(e.target.value)}
                                                                className="text-sm"
                                                            />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Select value={editLinkCity} onValueChange={setEditLinkCity}>
                                                                    <SelectTrigger className="text-sm">
                                                                        <SelectValue placeholder="도시 선택" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="시드니">시드니</SelectItem>
                                                                        <SelectItem value="멜버른">멜버른</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Input
                                                                    placeholder="구글맵 링크"
                                                                    value={editLinkUrl}
                                                                    onChange={(e) => setEditLinkUrl(e.target.value)}
                                                                    className="text-sm"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={handleUpdateGoogleMapLink}
                                                                    className="flex-1"
                                                                >
                                                                    <Check className="w-3 h-3 mr-1" />
                                                                    저장
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleCancelEditLink}
                                                                    className="flex-1"
                                                                >
                                                                    <X className="w-3 h-3 mr-1" />
                                                                    취소
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // 보기 모드
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-sm">{link.title}</h3>
                                                                {link.city && (
                                                                    <span className="text-xs text-muted-foreground">{link.city}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        window.open(link.url, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    열기
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleStartEditLink(link)}
                                                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteGoogleMapLink(link.id)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                    <AddPlaceDialog onPlaceAdded={fetchPlaces} />
                </div>
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
                                <PlaceMap 
                                    places={filteredPlaces} 
                                    onPlaceClick={(place) => {
                                        setSelectedPlace(place);
                                        setDetailDialogOpen(true);
                                    }}
                                />
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

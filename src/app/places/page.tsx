"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlaceCard, PlaceData, PlaceCategory } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { AddPlaceDialog } from "@/components/places/AddPlaceDialog";
import { EditPlaceDialog } from "@/components/places/EditPlaceDialog";
import { PlaceDetailDialog } from "@/components/places/PlaceDetailDialog";
import { AiImportDialog } from "@/components/places/AiImportDialog";
import { Loader2, Search, ArrowUpDown, Sparkles, Map, List, ExternalLink, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CityChipFilter } from "@/components/places/CityChipFilter";

import { db, generateId } from "@/lib/db";
import { useTrip } from "@/contexts/TripContext";
import { useTranslation } from "react-i18next";

const CATEGORIES: PlaceCategory[] = ["tour", "food", "play", "shop", "museum", "medical", "market"];

export default function PlacesPage() {
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "rating" | "newest">("newest");
    // city chip filter (all / specific city)
    const [selectedCityTab, setSelectedCityTab] = useState<string>("all");

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
    const [newLinkCity, setNewLinkCity] = useState("");
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [editLinkTitle, setEditLinkTitle] = useState("");
    const [editLinkUrl, setEditLinkUrl] = useState("");
    const [editLinkCity, setEditLinkCity] = useState("");
    const [selectedCityFilter, setSelectedCityFilter] = useState<string>("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { selectedTripId, selectedTrip } = useTrip();
    const { t } = useTranslation();

    const parsedCities = useMemo(() => {
        return selectedTrip?.cities
            ? ["전체", ...selectedTrip.cities.split(',').map(c => c.trim()).filter(Boolean)]
            : ["전체"];
    }, [selectedTrip?.cities]);

    useEffect(() => {
        const defaultCity = parsedCities.length > 1 ? parsedCities[1] : "";
        setNewLinkCity((prev) => (prev && parsedCities.includes(prev) ? prev : defaultCity));
        setEditLinkCity((prev) => (prev && parsedCities.includes(prev) ? prev : defaultCity));
    }, [parsedCities]);

    const fetchPlaces = useCallback(async () => {
        if (!selectedTripId) {
            setLoading(false);
            setPlaces([]);
            return;
        }

        try {
            setLoading(true);
            const data = await db.places
                .where('trip_id')
                .equals(selectedTripId)
                .toArray();

            if (data) {
                const formattedData: PlaceData[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    city: item.city || (parsedCities.length > 1 ? parsedCities[1] : ""),
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
    }, [selectedTripId, parsedCities]);

    // 구글맵 링크 불러오기
    const fetchGoogleMapLinks = useCallback(async () => {
        if (!selectedTripId) {
            setGoogleMapLinks([]);
            return;
        }

        try {
            setLoadingLinks(true);
            const data = await db.google_map_links
                .where('trip_id')
                .equals(selectedTripId)
                .toArray();

            // Dexie doesn't sort automatically
            data.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

            setGoogleMapLinks(data || []);
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoadingLinks(false);
        }
    }, [selectedTripId]);

    useEffect(() => {
        if (!selectedTripId) {
            setPlaces([]);
            setGoogleMapLinks([]);
            setLoading(false);
            setLoadingLinks(false);
            return;
        }

        fetchPlaces();
        fetchGoogleMapLinks();
    }, [selectedTripId, fetchPlaces, fetchGoogleMapLinks]);

    // 구글맵 링크 추가
    const handleAddGoogleMapLink = async () => {
        if (!selectedTripId) {
            alert(t("places.alert.selectTrip"));
            return;
        }

        if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
            alert(t("places.alert.fillTitleUrl"));
            return;
        }

        try {
            const newLinkId = generateId();
            await db.google_map_links.add({
                id: newLinkId,
                trip_id: selectedTripId,
                title: newLinkTitle.trim(),
                url: newLinkUrl.trim(),
                city: newLinkCity,
                created_at: new Date().toISOString()
            });

            setNewLinkTitle("");
            setNewLinkUrl("");
            setNewLinkCity(parsedCities.length > 1 ? parsedCities[1] : "");
            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error adding google map link:', err);
            alert(t("places.alert.addFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // 구글맵 링크 수정 시작
    const handleStartEditLink = (link: { id: string; title: string; url: string; city?: string }) => {
        setEditingLinkId(link.id);
        setEditLinkTitle(link.title);
        setEditLinkUrl(link.url);
        setEditLinkCity(link.city || (parsedCities.length > 1 ? parsedCities[1] : ""));
    };

    // 구글맵 링크 수정 취소
    const handleCancelEditLink = () => {
        setEditingLinkId(null);
        setEditLinkTitle("");
        setEditLinkUrl("");
        setEditLinkCity(parsedCities.length > 1 ? parsedCities[1] : "");
    };

    // 구글맵 링크 수정 완료
    const handleUpdateGoogleMapLink = async () => {
        if (!editingLinkId) return;

        if (!editLinkTitle.trim() || !editLinkUrl.trim()) {
            alert(t("places.alert.fillTitleUrl"));
            return;
        }

        try {
            await db.google_map_links.update(editingLinkId, {
                title: editLinkTitle.trim(),
                url: editLinkUrl.trim(),
                city: editLinkCity,
            });

            handleCancelEditLink();
            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error updating google map link:', err);
            alert(t("places.alert.updateFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // 구글맵 링크 삭제
    const handleDeleteGoogleMapLink = async (id: string) => {
        if (!confirm(t("places.alert.deleteConfirm"))) {
            return;
        }

        try {
            await db.google_map_links.delete(id);

            fetchGoogleMapLinks();
        } catch (err: any) {
            console.error('Error deleting google map link:', err);
            alert(t("places.alert.deleteFail", { message: err?.message || t("common.unknownError") }));
        }
    };

    // Derived State for Filtering
    const filteredPlaces = useMemo(() => {
        let filtered = places.filter((place) => {
            // 1. City Filter
            if (selectedCityTab !== "all" && place.city !== selectedCityTab) return false;

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
    }, [places, selectedCityTab, selectedCategory, searchQuery, sortBy]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCityTab, selectedCategory, searchQuery, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
    const paginatedPlaces = filteredPlaces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Calculate category counts for the CURRENT VIEW (based on selectedCityTab)
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const cityFilteredPlaces = places.filter((place) => {
            if (selectedCityTab === "all") return true;
            return place.city === selectedCityTab;
        });

        cityFilteredPlaces.forEach((place) => {
            counts[place.category] = (counts[place.category] || 0) + 1;
        });
        return counts;
    }, [places, selectedCityTab]);

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
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
                    <h1 className="text-2xl font-bold whitespace-nowrap shrink-0">{t("places.title")}</h1>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Dialog open={googleMapDialogOpen} onOpenChange={setGoogleMapDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-full"
                                title={t("places.googleMap")}
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {t("places.googleMap")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] !flex !flex-col overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle>{t("places.mapDialog.title")}</DialogTitle>
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
                                        {t("places.all")}
                                    </Button>
                                    {parsedCities.filter(c => c !== "전체").map(city => (
                                        <Button
                                            key={city}
                                            variant={selectedCityFilter === city ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedCityFilter(city)}
                                            className="text-xs"
                                        >
                                            {city}
                                        </Button>
                                    ))}
                                </div>

                                {/* 링크 추가 폼 */}
                                <div className="space-y-2 p-3 bg-muted rounded-lg">
                                    <Label className="text-sm font-semibold">{t("places.mapDialog.addNew")}</Label>
                                    <Input
                                        placeholder={t("places.mapDialog.titlePlaceholder")}
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={newLinkCity} onValueChange={setNewLinkCity}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("places.mapDialog.cityPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parsedCities.filter(c => c !== "전체").map(city => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder={t("places.mapDialog.urlPlaceholder")}
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
                                        {t("places.mapDialog.add")}
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
                                                ? t("places.mapDialog.emptyAll")
                                                : t("places.mapDialog.emptyByCity", { city: selectedCityFilter })}
                                        </p>
                                        <p className="text-sm mt-2">{t("places.mapDialog.emptyHint")}</p>
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
                                                                        {parsedCities.filter(c => c !== "전체").map(city => (
                                                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                        ))}
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
                    <AiImportDialog onImportSuccess={fetchPlaces} />
                    <AddPlaceDialog onPlaceAdded={fetchPlaces} />
                </div>
            </div>

            <div className="mt-4 space-y-4">
                {/* 필터 영역 */}
                <div className="bg-muted/40 rounded-xl p-3 space-y-3">
                    {/* 도시(시드/멜버른/브리즈번 등) 칩 */}
                    <CityChipFilter
                        cities={parsedCities.filter((c) => c !== "전체")}
                        selectedCity={selectedCityTab === "all" ? "all" : selectedCityTab}
                        allLabel={t("places.all")}
                        onSelectCity={(city) => setSelectedCityTab(city === "all" ? "all" : city)}
                    />

                    <Separator />

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
                                placeholder={t("places.searchPlaceholder")}
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
                                    <SelectItem value="newest">{t("places.sortNewest")}</SelectItem>
                                    <SelectItem value="name">{t("places.sortName")}</SelectItem>
                                    <SelectItem value="rating">{t("places.sortRating")}</SelectItem>
                                </SelectContent>
                            </Select>
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

                            {filteredPlaces.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-in fade-in duration-500">
                                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                        <Map className="w-10 h-10 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">{t("places.emptyTitle")}</h3>
                                    <p className="text-sm text-center max-w-[250px] mb-4">
                                        {searchQuery || selectedCategory !== "all"
                                            ? t("places.emptyFiltered")
                                            : t("places.emptyDefault")}
                                    </p>
                                    {(searchQuery || selectedCategory !== "all") && (
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategory("all");
                                        }}>
                                            {t("places.resetFilters")}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Pagination (List Mode Only) */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        {t("places.prev")}
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
                                        {t("places.next")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
            </div>


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

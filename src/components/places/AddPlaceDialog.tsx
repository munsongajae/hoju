"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { db, generateId } from "@/lib/db";
import { PlaceCategory } from "@/components/places/PlaceCard";
import { useTrip } from "@/contexts/TripContext";

interface AddPlaceDialogProps {
    onPlaceAdded: () => void;
}

export function AddPlaceDialog({ onPlaceAdded }: AddPlaceDialogProps) {
    const { selectedTripId } = useTrip();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState<PlaceCategory>("tour");
    const [rating, setRating] = useState("5");
    const [isKidFriendly, setIsKidFriendly] = useState(false);
    const [notes, setNotes] = useState("");
    const [googleMapUrl, setGoogleMapUrl] = useState("");
    const [address, setAddress] = useState("");
    const [operatingHours, setOperatingHours] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const { selectedTrip } = useTrip();

    const parsedCities = useMemo(() => {
        return selectedTrip?.cities
            ? selectedTrip.cities.split(',').map(c => c.trim()).filter(Boolean)
            : [];
    }, [selectedTrip?.cities]);

    // 초기값 설정
    useEffect(() => {
        if (open && !city) {
            setCity(parsedCities[0] || "");
        }
    }, [open, parsedCities, city]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTripId) {
            alert("여행을 선택해주세요.");
            return;
        }

        setLoading(true);

        try {
            const newPlaceId = generateId();
            await db.places.add({
                id: newPlaceId,
                name,
                city,
                category,
                rating: parseFloat(rating),
                is_kid_friendly: isKidFriendly,
                notes,
                google_map_url: googleMapUrl,
                address: address || undefined,
                operating_hours: operatingHours || undefined,
                contact_phone: contactPhone || undefined,
                website_url: websiteUrl || undefined,
                trip_id: selectedTripId,
                created_at: new Date().toISOString(),
                is_favorite: false,
                visit_count: 0
            });

            // Reset and Close
            setName("");
            setCity(parsedCities[0] || "");
            setCategory("tour");
            setRating("5");
            setIsKidFriendly(false);
            setNotes("");
            setGoogleMapUrl("");
            setAddress("");
            setOperatingHours("");
            setContactPhone("");
            setWebsiteUrl("");
            setOpen(false);
            onPlaceAdded(); // Refresh list
        } catch (error) {
            console.error("Error adding place:", error);
            alert("장소 추가에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full">
                    <Plus className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] !flex !flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>새 장소 추가</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0">
                    <form id="add-place-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">장소명 *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="예: 타롱가 동물원"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">도시</Label>
                            <Select value={city} onValueChange={setCity}>
                                <SelectTrigger id="city">
                                    <SelectValue placeholder="도시 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parsedCities.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">카테고리</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as PlaceCategory)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tour">관광</SelectItem>
                                    <SelectItem value="food">맛집</SelectItem>
                                    <SelectItem value="shop">쇼핑</SelectItem>
                                    <SelectItem value="play">놀이</SelectItem>
                                    <SelectItem value="museum">전시</SelectItem>
                                    <SelectItem value="medical">의료</SelectItem>
                                    <SelectItem value="market">시장</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="rating">별점 (1-5)</Label>
                        <Input
                            id="rating"
                            type="number"
                            min="1"
                            max="5"
                            step="0.5"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="kidFriendly"
                            checked={isKidFriendly}
                            onCheckedChange={(c) => setIsKidFriendly(c as boolean)}
                        />
                        <Label htmlFor="kidFriendly" className="cursor-pointer">아이 동반 추천</Label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">주소 (선택)</Label>
                        <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="예: 123 Main Street, Sydney"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="operatingHours">운영 시간 (선택)</Label>
                        <Input
                            id="operatingHours"
                            value={operatingHours}
                            onChange={(e) => setOperatingHours(e.target.value)}
                            placeholder="예: 월-금 9:00-17:00"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contactPhone">연락처 (선택)</Label>
                            <Input
                                id="contactPhone"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="예: +61 2 1234 5678"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="websiteUrl">웹사이트 (선택)</Label>
                            <Input
                                id="websiteUrl"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url">구글맵 링크 (선택)</Label>
                        <Input
                            id="url"
                            value={googleMapUrl}
                            onChange={(e) => setGoogleMapUrl(e.target.value)}
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">메모</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="팁, 주의사항 등..."
                        />
                    </div>

                    </form>
                </div>
                <DialogFooter className="flex-shrink-0">
                    <Button type="submit" form="add-place-form" disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        추가하기
                    </Button>
                </DialogFooter>
                {/* Ad 배너 영역 겹침 방지용 고정 여백 */}
                <div className="h-[60px] flex-shrink-0" />
            </DialogContent>
        </Dialog >
    );
}

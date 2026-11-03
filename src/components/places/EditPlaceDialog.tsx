"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Loader2, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { PlaceData, PlaceCategory } from "./PlaceCard";
import { useTrip } from "@/contexts/TripContext";

interface EditPlaceDialogProps {
    place: PlaceData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPlaceUpdated: () => void;
}

export function EditPlaceDialog({
    place,
    open,
    onOpenChange,
    onPlaceUpdated
}: EditPlaceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    useEffect(() => {
        if (place) {
            setName(place.name);
            setCity(place.city || parsedCities[0] || "");
            setCategory(place.category);
            setRating(String(place.rating || 5));
            setIsKidFriendly(place.isKidFriendly || false);
            setNotes(place.notes || "");
            setGoogleMapUrl(place.googleMapUrl || "");
            setAddress(place.address || "");
            setOperatingHours(place.operatingHours || "");
            setContactPhone(place.contactPhone || "");
            setWebsiteUrl(place.websiteUrl || "");
        }
    }, [place, parsedCities]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!place) return;
        setLoading(true);

        try {
            await db.places.update(place.id, {
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
            });

            onOpenChange(false);
            onPlaceUpdated();
        } catch (error) {
            console.error("Error updating place:", error);
            alert("장소 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!place) return;
        if (!confirm("정말 이 장소를 삭제하시겠습니까?")) return;

        setDeleting(true);
        try {
            await db.places.delete(place.id);

            onOpenChange(false);
            onPlaceUpdated();
        } catch (error) {
            console.error("Error deleting place:", error);
            alert("장소 삭제에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] !flex !flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>장소 수정</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0">
                    <form id="edit-place-form" onSubmit={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">장소명 *</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-city">도시</Label>
                            <Select value={city} onValueChange={setCity}>
                                <SelectTrigger id="edit-city">
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
                            <Label htmlFor="edit-category">카테고리</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as PlaceCategory)}>
                                <SelectTrigger id="edit-category">
                                    <SelectValue />
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
                        <Label htmlFor="edit-rating">별점 (1-5)</Label>
                        <Input
                            id="edit-rating"
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
                            id="edit-kidFriendly"
                            checked={isKidFriendly}
                            onCheckedChange={(c) => setIsKidFriendly(c as boolean)}
                        />
                        <Label htmlFor="edit-kidFriendly" className="cursor-pointer">아이 동반 추천</Label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-address">주소</Label>
                        <Input
                            id="edit-address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="예: 123 Main Street, Sydney"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-operatingHours">운영 시간</Label>
                        <Input
                            id="edit-operatingHours"
                            value={operatingHours}
                            onChange={(e) => setOperatingHours(e.target.value)}
                            placeholder="예: 월-금 9:00-17:00"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-contactPhone">연락처</Label>
                            <Input
                                id="edit-contactPhone"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="예: +61 2 1234 5678"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-websiteUrl">웹사이트</Label>
                            <Input
                                id="edit-websiteUrl"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-url">구글맵 링크</Label>
                        <Input
                            id="edit-url"
                            value={googleMapUrl}
                            onChange={(e) => setGoogleMapUrl(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-notes">메모</Label>
                        <Textarea
                            id="edit-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    </form>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between flex-shrink-0">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full sm:w-auto mr-auto"
                    >
                        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        삭제
                    </Button>
                    <Button type="submit" form="edit-place-form" disabled={loading} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        저장하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}

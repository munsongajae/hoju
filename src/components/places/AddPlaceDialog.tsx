"use client";

import { useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { PlaceCategory } from "@/components/places/PlaceCard";

interface AddPlaceDialogProps {
    onPlaceAdded: () => void;
}

export function AddPlaceDialog({ onPlaceAdded }: AddPlaceDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [category, setCategory] = useState<PlaceCategory>("tour");
    const [rating, setRating] = useState("5");
    const [isKidFriendly, setIsKidFriendly] = useState(false);
    const [notes, setNotes] = useState("");
    const [googleMapUrl, setGoogleMapUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from("places").insert([{
                name,
                category,
                rating: parseFloat(rating),
                is_kid_friendly: isKidFriendly,
                notes,
                google_map_url: googleMapUrl,
            }]);

            if (error) throw error;

            // Reset and Close
            setName("");
            setNotes("");
            setGoogleMapUrl("");
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>새 장소 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
                                </SelectContent>
                            </Select>
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

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            추가하기
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

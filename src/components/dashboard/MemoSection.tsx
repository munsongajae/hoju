"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Edit2, Loader2 } from "lucide-react";
import { useTrip } from "@/contexts/TripContext";

export function MemoSection() {
    const { selectedTripId } = useTrip();
    const [memo, setMemo] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // 메모 로드
    useEffect(() => {
        if (selectedTripId) {
            loadMemo();
        } else {
            setMemo("");
            setLoading(false);
        }
    }, [selectedTripId]);

    const loadMemo = () => {
        try {
            const savedMemo = localStorage.getItem(`trip_memo_${selectedTripId}`);
            if (savedMemo) {
                setMemo(savedMemo);
            }
        } catch (err) {
            console.error("Failed to load memo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!selectedTripId) return;

        setSaving(true);
        try {
            localStorage.setItem(`trip_memo_${selectedTripId}`, memo);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save memo:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        loadMemo();
        setIsEditing(false);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        메모
                    </CardTitle>
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="h-8"
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            편집
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-3">
                        <Textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="메모를 입력하세요..."
                            className="min-h-[120px] resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                취소
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-1" />
                                        저장
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="min-h-[120px] p-3 bg-muted rounded-md text-sm whitespace-pre-wrap break-words"
                        onClick={() => setIsEditing(true)}
                    >
                        {memo || (
                            <span className="text-muted-foreground">
                                메모를 입력하려면 클릭하세요...
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Loader2, Smile, Zap, Coffee, Moon, ThermometerSun, Meh, Edit, Calendar, Trash2, Filter, Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { useTrip } from "@/contexts/TripContext";

interface DiaryEntry {
    id: string;
    day_number: number;
    date: string;
    title: string;
    content: string;
    mood: string;
    image_urls?: string[] | null;
}

// 피드 이미지 캐러셀 컴포넌트
function FeedImageCarousel({
    entryId,
    images,
    title,
    currentIndex,
    onNavigate,
    onImageClick,
    onIndexChange
}: {
    entryId: string;
    images: string[];
    title: string;
    currentIndex: number;
    onNavigate: (direction: "prev" | "next") => void;
    onImageClick: () => void;
    onIndexChange?: (index: number) => void;
}) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // 터치 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            onNavigate("next");
        } else if (isRightSwipe) {
            onNavigate("prev");
        }
    };

    return (
        <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-900 group">
            {/* 현재 이미지 */}
            <div
                className="relative w-full h-full cursor-pointer overflow-hidden"
                onClick={(e) => {
                    e.stopPropagation();
                    onImageClick();
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    key={`${entryId}-${currentIndex}`}
                    src={images[currentIndex]}
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* 이미지 오버레이 (클릭 유도) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            
            {/* 여러 이미지일 때 좌우 화살표 버튼 */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("prev");
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                        aria-label="이전 이미지"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("next");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                        aria-label="다음 이미지"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* 이미지 인디케이터 (점) - 클릭 가능 */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onIndexChange) {
                                        onIndexChange(index);
                                    }
                                }}
                                className={`h-1.5 rounded-full transition-all ${
                                    currentIndex === index
                                        ? "bg-white w-6"
                                        : "bg-white/50 w-1.5"
                                }`}
                                aria-label={`이미지 ${index + 1}`}
                            />
                        ))}
                    </div>
                    {/* 이미지 카운터 */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
}

const MOODS = [
    { value: "happy", label: "행복", icon: Smile, color: "bg-yellow-100 text-yellow-700" },
    { value: "excited", label: "신남", icon: Zap, color: "bg-orange-100 text-orange-700" },
    { value: "relaxed", label: "편안", icon: Coffee, color: "bg-green-100 text-green-700" },
    { value: "tired", label: "피곤", icon: Moon, color: "bg-blue-100 text-blue-700" },
    { value: "sick", label: "아픔", icon: ThermometerSun, color: "bg-red-100 text-red-700" },
    { value: "normal", label: "보통", icon: Meh, color: "bg-zinc-100 text-zinc-700" },
];

export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
    const { selectedTripId, selectedTrip } = useTrip();

    // 필터 상태
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [dateRangeStart, setDateRangeStart] = useState("");
    const [dateRangeEnd, setDateRangeEnd] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formMoods, setFormMoods] = useState<string[]>(["normal"]);
    const [formImages, setFormImages] = useState<File[]>([]);
    const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // 상세 보기 및 이미지 뷰어 상태
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    
    // 피드에서 각 일기의 현재 이미지 인덱스 관리
    const [entryImageIndices, setEntryImageIndices] = useState<Record<string, number>>({});

    useEffect(() => {
        if (selectedTrip) {
            setTripStartDate(parseISO(selectedTrip.start_date));
            loadData();
        }
    }, [selectedTrip]);

    // 키보드 이벤트 (이미지 뷰어에서 좌우 화살표 키로 이미지 이동)
    useEffect(() => {
        if (!imageViewerOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                navigateImage("prev");
            } else if (e.key === "ArrowRight") {
                navigateImage("next");
            } else if (e.key === "Escape") {
                setImageViewerOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [imageViewerOpen, selectedImageUrls.length]);

    async function loadData() {
        if (!selectedTripId) return;

        try {
            // Load diary entries
            const { data: diaryData, error } = await supabase
                .from("diaries")
                .select("*")
                .order("date", { ascending: false });

            if (error) {
                console.error("Error loading diaries:", error);
            } else if (diaryData) {
                setEntries(diaryData);
            }
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    }

    function openNewEntry() {
        setEditingId(null);
        setFormDate(format(new Date(), "yyyy-MM-dd"));
        setFormTitle("");
        setFormContent("");
        setFormMoods(["normal"]);
        setFormImages([]);
        setFormImageUrls([]);
        setDialogOpen(true);
    }

    function openDetailEntry(entry: DiaryEntry) {
        setSelectedEntry(entry);
        setDetailDialogOpen(true);
    }

    function openEditEntry(entry: DiaryEntry) {
        setEditingId(entry.id);
        setFormDate(entry.date);
        setFormTitle(entry.title || "");
        setFormContent(entry.content || "");
        setFormMoods(entry.mood ? entry.mood.split(",") : ["normal"]);
        setFormImages([]);
        setFormImageUrls(entry.image_urls || []);
        setDialogOpen(true);
        setDetailDialogOpen(false); // 상세 보기 닫기
    }

    function openImageViewer(urls: string[], startIndex: number = 0) {
        setSelectedImageUrls(urls);
        setSelectedImageIndex(startIndex);
        setImageViewerOpen(true);
    }

    function navigateImage(direction: "prev" | "next") {
        if (direction === "prev") {
            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImageUrls.length - 1));
        } else {
            setSelectedImageIndex((prev) => (prev < selectedImageUrls.length - 1 ? prev + 1 : 0));
        }
    }

    // 피드에서 일기 이미지 넘기기
    function navigateFeedImage(entryId: string, direction: "prev" | "next", totalImages: number) {
        setEntryImageIndices((prev) => {
            const currentIndex = prev[entryId] || 0;
            let newIndex: number;
            if (direction === "prev") {
                newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
            } else {
                newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
            }
            return { ...prev, [entryId]: newIndex };
        });
    }

    // 인디케이터 클릭으로 직접 이미지 이동
    function setFeedImageIndex(entryId: string, index: number) {
        setEntryImageIndices((prev) => ({ ...prev, [entryId]: index }));
    }

    // 이미지 리사이징 함수
    async function resizeImage(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 최대 크기 계산 (긴 변 기준 1600px)
                    const MAX_SIZE = 1600;
                    let width = img.width;
                    let height = img.height;

                    // 비율 유지하면서 리사이징
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = (height * MAX_SIZE) / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = (width * MAX_SIZE) / height;
                            height = MAX_SIZE;
                        }
                    }

                    // Canvas로 리사이징
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error('Canvas context를 가져올 수 없습니다.'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // WebP로 변환 (quality: 0.8)
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('이미지 변환에 실패했습니다.'));
                                return;
                            }
                            // 원본 파일명에서 확장자만 webp로 변경
                            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                            const resizedFile = new File([blob], fileName, {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });
                            resolve(resizedFile);
                        },
                        'image/webp',
                        0.8
                    );
                };
                img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
            reader.readAsDataURL(file);
        });
    }

    // 이미지 업로드
    const uploadImages = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of files) {
                // 이미지 리사이징 (WebP, 1600px max, quality 0.8)
                let fileToUpload = file;
                if (file.type.startsWith('image/')) {
                    try {
                        fileToUpload = await resizeImage(file);
                    } catch (resizeError) {
                        console.error('이미지 리사이징 실패, 원본 파일 사용:', resizeError);
                        // 리사이징 실패 시 원본 파일 사용
                    }
                }

                const fileExt = fileToUpload.name.split('.').pop();
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(7);
                const fileName = `${selectedTripId}/${timestamp}-${randomStr}.${fileExt}`;
                const filePath = fileName;

                const { error: uploadError } = await supabase.storage
                    .from('diary-images')
                    .upload(filePath, fileToUpload, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    continue;
                }

                const { data } = supabase.storage
                    .from('diary-images')
                    .getPublicUrl(filePath);

                if (data?.publicUrl) {
                    uploadedUrls.push(data.publicUrl);
                }
            }
        } catch (err) {
            console.error('Error uploading images:', err);
        } finally {
            setUploadingImages(false);
        }

        return uploadedUrls;
    };

    // 이미지 삭제
    const deleteImage = async (imageUrl: string) => {
        try {
            // URL에서 파일 경로 추출
            // Supabase Storage URL 형식: https://[project].supabase.co/storage/v1/object/public/diary-images/[path]
            const urlParts = imageUrl.split('/diary-images/');
            if (urlParts.length < 2) return;

            const filePath = urlParts[1].split('?')[0]; // 쿼리 파라미터 제거
            const { error } = await supabase.storage
                .from('diary-images')
                .remove([filePath]);

            if (error) {
                console.error('Error deleting image:', error);
            }
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    async function handleSave() {
        if (!selectedTripId || !tripStartDate) return;

        setSaving(true);
        try {
            // 새로 선택한 이미지 업로드
            const newImageUrls = await uploadImages(formImages);
            const allImageUrls = [...formImageUrls, ...newImageUrls];
            
            // formImages 초기화 (업로드 완료 후)
            setFormImages([]);

            const entryDate = parseISO(formDate);
            const diffDays = differenceInDays(entryDate, tripStartDate);
            const isTripStarted = diffDays >= 0;
            const dayNum = isTripStarted ? diffDays + 1 : Math.abs(diffDays);

            const diaryData = {
                trip_id: selectedTripId,
                day_number: isTripStarted ? dayNum : -dayNum, // 음수는 D-day 표시용
                date: formDate,
                title: formTitle || (isTripStarted ? `Day ${dayNum} 일기` : `D-${dayNum} 준비 일기`),
                content: formContent,
                mood: formMoods.join(","),
                image_urls: allImageUrls.length > 0 ? allImageUrls : null,
                updated_at: new Date().toISOString(),
            };

            if (editingId) {
                const { error } = await supabase
                    .from("diaries")
                    .update(diaryData)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("diaries")
                    .insert([diaryData]);
                if (error) throw error;
            }

            setDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error("Failed to save diary:", err);
            alert(`저장 실패: ${err?.message || JSON.stringify(err) || "알 수 없는 오류"}`);
        } finally {
            setSaving(false);
            setUploadingImages(false);
        }
    }

    async function handleDelete() {
        if (!editingId) return;

        const confirmed = window.confirm("정말 이 일기를 삭제하시겠습니까?");
        if (!confirmed) return;

        setDeleting(true);
        try {
            // 일기와 함께 이미지도 삭제
            const entry = entries.find(e => e.id === editingId);
            if (entry?.image_urls && entry.image_urls.length > 0) {
                for (const imageUrl of entry.image_urls) {
                    await deleteImage(imageUrl);
                }
            }

            const { error } = await supabase
                .from("diaries")
                .delete()
                .eq("id", editingId);

            if (error) throw error;

            setDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error("Failed to delete diary:", err);
            alert(`삭제 실패: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setDeleting(false);
        }
    }

    const getMoodInfo = (mood: string) => MOODS.find(m => m.value === mood) || MOODS[5];

    const toggleMood = (moodValue: string) => {
        setFormMoods(prev => {
            if (prev.includes(moodValue)) {
                // Prevent removing the last mood if there's only one
                if (prev.length === 1) return prev;
                return prev.filter(m => m !== moodValue);
            } else {
                return [...prev, moodValue];
            }
        });
    };

    const toggleFilterMood = (moodValue: string) => {
        setSelectedMoods(prev => 
            prev.includes(moodValue)
                ? prev.filter(m => m !== moodValue)
                : [...prev, moodValue]
        );
    };

    // 필터링된 일기 목록
    const filteredEntries = useMemo(() => {
        return entries.filter((entry) => {
            // 기분 필터
            const moodMatch = selectedMoods.length === 0 || 
                entry.mood.split(",").some(m => selectedMoods.includes(m));
            
            // 날짜 범위 필터
            const entryDate = parseISO(entry.date);
            const startMatch = !dateRangeStart || entryDate >= parseISO(dateRangeStart);
            const endMatch = !dateRangeEnd || entryDate <= parseISO(dateRangeEnd);
            
            return moodMatch && startMatch && endMatch;
        });
    }, [entries, selectedMoods, dateRangeStart, dateRangeEnd]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">여행 일기</h1>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" />
                    </Button>
                    <Button onClick={openNewEntry} size="icon" className="h-8 w-8 rounded-full">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* 필터 섹션 */}
            {showFilters && (
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">기분 필터</Label>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map(mood => {
                                const Icon = mood.icon;
                                const isSelected = selectedMoods.includes(mood.value);
                                return (
                                    <button
                                        key={mood.value}
                                        type="button"
                                        onClick={() => toggleFilterMood(mood.value)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                                            isSelected
                                                ? mood.color + " ring-2 ring-offset-1 ring-primary"
                                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {mood.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedMoods.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMoods([])}
                                className="text-xs"
                            >
                                필터 초기화
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">날짜 범위</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                placeholder="시작 날짜"
                                value={dateRangeStart}
                                onChange={(e) => setDateRangeStart(e.target.value)}
                                className="flex-1"
                            />
                            <span className="self-center">~</span>
                            <Input
                                type="date"
                                placeholder="종료 날짜"
                                value={dateRangeEnd}
                                onChange={(e) => setDateRangeEnd(e.target.value)}
                                className="flex-1"
                            />
                            {(dateRangeStart || dateRangeEnd) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDateRangeStart("");
                                        setDateRangeEnd("");
                                    }}
                                >
                                    초기화
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {filteredEntries.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>조건에 맞는 일기가 없습니다.</p>
                    <p className="text-sm">
                        {entries.length === 0 
                            ? "오늘의 여행을 기록해보세요!" 
                            : "필터를 조정해보세요."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map((entry) => {
                        const hasImages = entry.image_urls && entry.image_urls.length > 0;
                        const currentImageIndex = entryImageIndices[entry.id] || 0;
                        const currentImage = hasImages && entry.image_urls ? entry.image_urls[currentImageIndex] : null;

                        return (
                            <Card
                                key={entry.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow gap-0"
                            >
                                {/* 헤더 (인스타그램 스타일) */}
                                <CardHeader className="pb-1 pt-1 px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-bold">
                                                {entry.day_number > 0 ? `Day ${entry.day_number}` : `D-${Math.abs(entry.day_number)}`}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {format(parseISO(entry.date), "M월 d일 (EEE)", { locale: ko })}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {entry.mood.split(",").map(m => {
                                                const moodInfo = getMoodInfo(m);
                                                const MoodIcon = moodInfo.icon;
                                                return (
                                                    <Badge key={m} className={moodInfo.color + " border-0"}>
                                                        <MoodIcon className="w-3 h-3 mr-1" />
                                                        {moodInfo.label}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* 메인 이미지 (인스타그램 스타일) */}
                                {hasImages && entry.image_urls && entry.image_urls.length > 0 && (
                                    <FeedImageCarousel
                                        entryId={entry.id}
                                        images={entry.image_urls}
                                        title={entry.title}
                                        currentIndex={entryImageIndices[entry.id] || 0}
                                        onNavigate={(direction) => navigateFeedImage(entry.id, direction, entry.image_urls?.length || 0)}
                                        onImageClick={() => {
                                            const currentIndex = entryImageIndices[entry.id] || 0;
                                            openImageViewer(entry.image_urls || [], currentIndex);
                                        }}
                                        onIndexChange={(index) => setFeedImageIndex(entry.id, index)}
                                    />
                                )}

                                {/* 콘텐츠 */}
                                <CardContent className="px-4 pb-2 pt-2">
                                    <h3 className="font-semibold mb-1 text-lg">{entry.title}</h3>
                                    {entry.content && (
                                        <p 
                                            className="text-sm text-muted-foreground line-clamp-3 mb-2"
                                        >
                                            {entry.content}
                                        </p>
                                    )}
                                    {/* 더보기 버튼 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDetailEntry(entry);
                                        }}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        더보기...
                                    </button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* 상세 보기 Dialog (블로그 형식) */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{selectedEntry?.title}</DialogTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="font-bold">
                                {selectedEntry && (selectedEntry.day_number > 0 ? `Day ${selectedEntry.day_number}` : `D-${Math.abs(selectedEntry.day_number)}`)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {selectedEntry && format(parseISO(selectedEntry.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
                            </span>
                        </div>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 min-h-0">
                        {selectedEntry && (
                            <div className="space-y-4 py-4">
                                {/* 기분 표시 */}
                                <div className="flex gap-1 flex-wrap">
                                    {selectedEntry.mood.split(",").map(m => {
                                        const moodInfo = getMoodInfo(m);
                                        const MoodIcon = moodInfo.icon;
                                        return (
                                            <Badge key={m} className={moodInfo.color + " border-0"}>
                                                <MoodIcon className="w-3 h-3 mr-1" />
                                                {moodInfo.label}
                                            </Badge>
                                        )
                                    })}
                                </div>

                                {/* 이미지 갤러리 */}
                                {selectedEntry.image_urls && selectedEntry.image_urls.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedEntry.image_urls.map((url, index) => (
                                                <div
                                                    key={index}
                                                    className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden cursor-pointer group"
                                                    onClick={() => openImageViewer(selectedEntry.image_urls || [], index)}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`일기 이미지 ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 일기 내용 */}
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                        {selectedEntry.content || <span className="italic text-muted-foreground">내용 없음</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDetailDialogOpen(false);
                                if (selectedEntry) {
                                    openEditEntry(selectedEntry);
                                }
                            }}
                            className="w-full"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            수정하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 이미지 뷰어 (Lightbox) */}
            <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] !flex !flex-col overflow-hidden p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>이미지 보기</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex-1 flex items-center justify-center bg-black/95">
                        {selectedImageUrls.length > 0 && (
                            <>
                                <img
                                    src={selectedImageUrls[selectedImageIndex]}
                                    alt={`이미지 ${selectedImageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                                {/* 이전/다음 버튼 */}
                                {selectedImageUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => navigateImage("prev")}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => navigateImage("next")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        {/* 이미지 인디케이터 */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                                            {selectedImageIndex + 1} / {selectedImageUrls.length}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] !flex !flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>{editingId ? "일기 수정" : "새 일기 작성"}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 min-h-0">

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>날짜</Label>
                            <Input
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>제목</Label>
                            <Input
                                placeholder="오늘의 제목"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>오늘의 기분</Label>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map(mood => {
                                    const Icon = mood.icon;
                                    return (
                                        <button
                                            key={mood.value}
                                            type="button"
                                            onClick={() => toggleMood(mood.value)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${formMoods.includes(mood.value)
                                                ? mood.color + " ring-2 ring-offset-1 ring-primary"
                                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {mood.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>일기 내용</Label>
                            <Textarea
                                placeholder="오늘 하루를 자유롭게 기록하세요..."
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                rows={6}
                            />
                        </div>

                        {/* 이미지 업로드 */}
                        <div className="space-y-2">
                            <Label>사진 첨부</Label>
                            <div className="space-y-3">
                                {/* 기존 이미지 미리보기 */}
                                {formImageUrls.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {formImageUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`첨부 이미지 ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormImageUrls(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 새 이미지 미리보기 */}
                                {formImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {formImages.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`새 이미지 ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormImages(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 이미지 업로드 버튼 */}
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {uploadingImages ? "업로드 중..." : "사진 추가"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setFormImages(prev => [...prev, ...files]);
                                        }}
                                        disabled={uploadingImages}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between flex-shrink-0">
                        {editingId && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full sm:w-auto"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                삭제
                            </Button>
                        )}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
                                취소
                            </Button>
                            <Button onClick={handleSave} disabled={saving || uploadingImages} className="flex-1 sm:flex-none">
                                {(saving || uploadingImages) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {uploadingImages ? "업로드 중..." : "저장"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

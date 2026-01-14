"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Coffee, Map, Plane, BedDouble, Baby, ShoppingBag, Check, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useDroppable,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type ScheduleType = "view" | "food" | "move" | "rest" | "shop" | "kids";

export interface ScheduleItemData {
    id: string;
    day: number;
    city: string;
    time: string;
    rawTime?: string; // HH:MM:SS format for comparison
    title: string;
    type: ScheduleType;
    memo?: string;
    isCompleted?: boolean;
    place_id?: string | null;
    displayOrder?: number;
    place?: {
        id: string;
        name: string;
        category?: string;
    } | null;
}

interface ScheduleListProps {
    items: ScheduleItemData[];
    tripStartDate?: Date | null;
    onItemClick?: (item: ScheduleItemData) => void;
    onToggleComplete?: (item: ScheduleItemData) => void;
    onOrderChange?: (updates: Array<{ id: string; day: number; displayOrder: number }>) => void;
}

const typeConfig = {
    view: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Map },
    food: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: Coffee },
    move: { color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: Plane },
    rest: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: BedDouble },
    shop: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: ShoppingBag },
    kids: { color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300", icon: Baby },
};

// SortableItem 컴포넌트
function SortableScheduleItem({
    item,
    tripStartDate,
    onItemClick,
    onToggleComplete,
    isDraggingContext,
}: {
    item: ScheduleItemData;
    tripStartDate?: Date | null;
    onItemClick?: (item: ScheduleItemData) => void;
    onToggleComplete?: (item: ScheduleItemData) => void;
    isDraggingContext?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const Config = typeConfig[item.type] || typeConfig.view;
    const Icon = Config.icon;

    const handleClick = (e: React.MouseEvent) => {
        // 드래그가 시작되지 않았을 때만 onClick 실행
        if (!isDragging && !isDraggingContext && onItemClick) {
            onItemClick(item);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "ml-8 relative py-2 pr-2 flex items-start gap-3",
                onItemClick && "cursor-pointer hover:bg-muted/50 rounded-lg transition-colors",
                item.isCompleted && "opacity-50",
                isDragging && "z-50"
            )}
        >
            <span className={cn(
                "absolute -left-[45px] top-2 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                item.isCompleted ? "bg-green-500 text-white" : Config.color
            )}>
                {item.isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
            </span>

            {onToggleComplete && (
                <Checkbox
                    checked={item.isCompleted || false}
                    onCheckedChange={() => onToggleComplete(item)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            <div
                {...attributes}
                {...listeners}
                className="flex-1"
                onClick={handleClick}
                style={{ touchAction: 'none' }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className={cn(
                        "text-base font-medium",
                        item.isCompleted && "line-through"
                    )}>{item.title}</h4>
                    <time className="text-xs text-muted-foreground font-mono">{item.time}</time>
                </div>

                {item.place && (
                    <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                            {item.place.name}
                        </span>
                    </div>
                )}
                {item.memo && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.memo}
                    </p>
                )}
            </div>
        </div>
    );
}

export function ScheduleList({ items, tripStartDate, onItemClick, onToggleComplete, onOrderChange }: ScheduleListProps) {
    const isDraggingRef = useRef(false);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px 이상 이동해야 드래그 시작 (데스크톱)
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // 250ms 길게 누르면 드래그 모드 활성화 (모바일)
                tolerance: 8, // 8px 이내의 작은 움직임 허용
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    // Helper to get actual date for a day number
    const getDateForDay = (dayNum: number) => {
        if (!tripStartDate) return null;
        return addDays(tripStartDate, dayNum - 1);
    };
    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                선택한 일정/지역에 해당하는 항목이 없습니다.
            </div>
        );
    }

    // Group items by Day if showing multiple days
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, ScheduleItemData[]>);

    // Sort items within each day by displayOrder, then by time
    Object.keys(groupedItems).forEach((day) => {
        const dayNum = Number(day);
        groupedItems[dayNum].sort((a, b) => {
            const orderA = a.displayOrder ?? 0;
            const orderB = b.displayOrder ?? 0;
            if (orderA !== orderB) return orderA - orderB;
            // If displayOrder is same, sort by time
            if (a.rawTime && b.rawTime) {
                return a.rawTime.localeCompare(b.rawTime);
            }
            return 0;
        });
    });

    const sortedDays = Object.keys(groupedItems).map(Number).sort((a, b) => a - b);
    
    // 모든 아이템의 ID를 하나의 배열로 만들기
    const allItemIds = items.map((item) => item.id);

    // Day별 Droppable 영역 컴포넌트
    function DayDroppable({ day, children }: { day: number; children: React.ReactNode }) {
        const { setNodeRef } = useDroppable({
            id: `day-${day}`,
        });

        return <div ref={setNodeRef}>{children}</div>;
    }

    const handleDragStart = (event: DragStartEvent) => {
        isDraggingRef.current = true;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        isDraggingRef.current = false;
        const { active, over } = event;

        if (!over) {
            return;
        }

        // 드래그된 아이템 찾기
        const draggedItem = items.find((item) => item.id === active.id);
        if (!draggedItem) {
            return;
        }

        // 드롭된 위치가 다른 아이템인지, day 영역인지 확인
        let targetDay = draggedItem.day;
        let targetIndex = -1;

        if (typeof over.id === 'string' && over.id.startsWith('day-')) {
            // Day 영역에 드롭된 경우
            targetDay = Number(over.id.replace('day-', ''));
            targetIndex = groupedItems[targetDay]?.length ?? 0;
        } else {
            // 다른 아이템 위에 드롭된 경우
            const targetItem = items.find((item) => item.id === over.id);
            if (targetItem) {
                targetDay = targetItem.day;
                const dayItems = groupedItems[targetDay] || [];
                targetIndex = dayItems.findIndex((item) => item.id === targetItem.id);
            }
        }

        if (targetIndex === -1 && groupedItems[targetDay]) {
            targetIndex = groupedItems[targetDay].length;
        }

        // 같은 day 내에서 이동하는 경우
        if (draggedItem.day === targetDay) {
            const dayItems = groupedItems[targetDay];
            const oldIndex = dayItems.findIndex((item) => item.id === active.id);
            
            if (oldIndex !== -1 && targetIndex !== -1 && oldIndex !== targetIndex) {
                const reorderedItems = arrayMove(dayItems, oldIndex, targetIndex);
                const updates = reorderedItems.map((item, index) => ({
                    id: item.id,
                    day: targetDay,
                    displayOrder: index,
                }));
                onOrderChange?.(updates);
            }
        } else {
            // 다른 day로 이동하는 경우
            const sourceDayItems = groupedItems[draggedItem.day] || [];
            const targetDayItems = groupedItems[targetDay] || [];
            
            const oldIndex = sourceDayItems.findIndex((item) => item.id === active.id);
            if (oldIndex === -1) return;

            // 소스 day에서 제거
            const newSourceItems = sourceDayItems.filter((item) => item.id !== active.id);
            
            // 타겟 day에 추가
            const newTargetItems = [...targetDayItems];
            newTargetItems.splice(targetIndex, 0, { ...draggedItem, day: targetDay });

            // 모든 업데이트 생성
            const updates: Array<{ id: string; day: number; displayOrder: number }> = [];
            
            // 소스 day의 display_order 재조정
            newSourceItems.forEach((item, index) => {
                updates.push({
                    id: item.id,
                    day: draggedItem.day,
                    displayOrder: index,
                });
            });

            // 타겟 day의 display_order 재조정
            newTargetItems.forEach((item, index) => {
                updates.push({
                    id: item.id,
                    day: targetDay,
                    displayOrder: index,
                });
            });

            onOrderChange?.(updates);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-8">
                    {sortedDays.map((day) => {
                        const dayItems = groupedItems[day];

                        return (
                            <DayDroppable key={day} day={day}>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-sm",
                                            day <= 0 ? "bg-zinc-500 text-white" : "bg-primary text-primary-foreground"
                                        )}>
                                            {day <= 0 ? `D-${Math.abs(day - 1)} (준비)` : `Day ${day}`}
                                        </span>
                                        {tripStartDate && (
                                            <span className="text-primary text-sm font-semibold">
                                                {format(getDateForDay(day)!, "M/d (EEE)", { locale: ko })}
                                            </span>
                                        )}
                                        <span className="text-muted-foreground text-sm font-normal">· {dayItems[0].city}</span>
                                    </h3>

                                    <div className="relative border-l border-border ml-3 space-y-6 pb-2">
                                        {dayItems.map((item) => (
                                            <SortableScheduleItem
                                                key={item.id}
                                                item={item}
                                                tripStartDate={tripStartDate}
                                                onItemClick={onItemClick}
                                                onToggleComplete={onToggleComplete}
                                                isDraggingContext={isDraggingRef.current}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </DayDroppable>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
}

/**
 * 여행 데이터를 텍스트/클립보드로 공유하는 유틸리티
 * Capacitor Share API와 Web Share API를 모두 지원합니다.
 */

import { Capacitor } from "@capacitor/core";

/** 클립보드 복사 + 네이티브/웹 공유 */
export async function shareText(title: string, text: string): Promise<"shared" | "copied" | "error"> {
    // 1. 네이티브 앱 (Capacitor)
    if (Capacitor.isNativePlatform()) {
        try {
            const { Share } = await import("@capacitor/share");
            await Share.share({ title, text, dialogTitle: title });
            return "shared";
        } catch (err) {
            console.warn("Capacitor Share failed, falling back:", err);
        }
    }

    // 2. Web Share API (모바일 브라우저)
    if (typeof navigator !== "undefined" && navigator.share) {
        try {
            await navigator.share({ title, text });
            return "shared";
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== "AbortError") {
                console.warn("Web Share failed, falling back:", err);
            } else {
                return "error"; // user cancelled
            }
        }
    }

    // 3. 클립보드 복사 (PC 브라우저 fallback)
    try {
        await navigator.clipboard.writeText(text);
        return "copied";
    } catch {
        // 마지막 수단
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        return "copied";
    }
}

// ─────────────────────────────────────────────
// 포맷터: 일정 → 텍스트
// ─────────────────────────────────────────────
export interface ShareScheduleItem {
    day_number: number;
    date?: string;
    start_time?: string;
    title: string;
    city?: string;
    type?: string;
    memo?: string;
    is_completed?: boolean;
}

const TYPE_EMOJI: Record<string, string> = {
    view: "🏛", food: "🍽", move: "🚗", rest: "🛌",
    shop: "🛍", kids: "🎡", default: "📌",
};

export function formatScheduleText(
    tripTitle: string,
    items: ShareScheduleItem[],
    filterLabel?: string
): string {
    if (items.length === 0) return `[${tripTitle}] 일정이 없습니다.`;

    const lines: string[] = [];
    lines.push(`✈️ ${tripTitle} 여행 일정`);
    if (filterLabel) lines.push(`📋 ${filterLabel}`);
    lines.push("─".repeat(30));

    // 날짜별 그룹
    const grouped = items.reduce((acc, item) => {
        const key = `Day ${item.day_number}${item.date ? ` (${item.date})` : ""}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ShareScheduleItem[]>);

    Object.entries(grouped).forEach(([day, dayItems]) => {
        lines.push(`\n📅 ${day}`);
        dayItems
            .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
            .forEach(item => {
                const emoji = TYPE_EMOJI[item.type || ""] || TYPE_EMOJI.default;
                const time = item.start_time ? item.start_time.slice(0, 5) + " " : "";
                const done = item.is_completed ? "✅ " : "";
                const city = item.city ? ` [${item.city}]` : "";
                lines.push(`  ${done}${emoji} ${time}${item.title}${city}`);
                if (item.memo) lines.push(`     💬 ${item.memo}`);
            });
    });

    lines.push("\n" + "─".repeat(30));
    lines.push("📱 J 여관 앱으로 관리중");
    return lines.join("\n");
}

// ─────────────────────────────────────────────
// 포맷터: 지출 → 텍스트
// ─────────────────────────────────────────────
export interface ShareExpenseItem {
    date: Date | string;
    title: string;
    amount: number;
    currency?: string;
    category?: string;
    city?: string;
}

const CAT_EMOJI: Record<string, string> = {
    food: "🍽", transport: "🚗", lodging: "🏨",
    activity: "🎡", shopping: "🛍", etc: "📦",
};

const CURRENCY_SYMBOL: Record<string, string> = {
    AUD: "A$", USD: "$", KRW: "₩", JPY: "¥", EUR: "€",
    GBP: "£", THB: "฿", VND: "₫", SGD: "S$", HKD: "HK$",
};

export function formatExpenseText(
    tripTitle: string,
    items: ShareExpenseItem[],
    filterLabel?: string
): string {
    if (items.length === 0) return `[${tripTitle}] 지출 내역이 없습니다.`;

    const lines: string[] = [];
    lines.push(`💰 ${tripTitle} 지출 내역`);
    if (filterLabel) lines.push(`📋 ${filterLabel}`);
    lines.push("─".repeat(30));

    // 날짜별 그룹
    const grouped = items.reduce((acc, item) => {
        const d = item.date instanceof Date ? item.date : new Date(item.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ShareExpenseItem[]>);

    let grandTotal: Record<string, number> = {};

    Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([dateKey, dayItems]) => {
            const [, month, day] = dateKey.split("-");
            lines.push(`\n📅 ${month}월 ${day}일`);

            const dayTotals: Record<string, number> = {};
            dayItems.forEach(item => {
                const cur = item.currency || "AUD";
                const sym = CURRENCY_SYMBOL[cur] || cur + " ";
                const catEmoji = CAT_EMOJI[item.category || ""] || "📦";
                lines.push(`  ${catEmoji} ${item.title}  ${sym}${item.amount.toLocaleString()}`);
                dayTotals[cur] = (dayTotals[cur] || 0) + item.amount;
                grandTotal[cur] = (grandTotal[cur] || 0) + item.amount;
            });

            const dayTotalStr = Object.entries(dayTotals)
                .map(([cur, amt]) => `${CURRENCY_SYMBOL[cur] || cur}${amt.toLocaleString()}`)
                .join(" + ");
            lines.push(`  소계: ${dayTotalStr}`);
        });

    lines.push("\n" + "─".repeat(30));
    const totalStr = Object.entries(grandTotal)
        .map(([cur, amt]) => `${CURRENCY_SYMBOL[cur] || cur}${amt.toLocaleString()}`)
        .join(" + ");
    lines.push(`💳 총 지출: ${totalStr}`);
    lines.push("📱 J 여관 앱으로 관리중");
    return lines.join("\n");
}

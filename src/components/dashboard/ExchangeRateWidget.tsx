"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { fetchExchangeRate } from "@/lib/exchangeRate";
import { useTranslation } from "react-i18next";

const CURRENCY_SYMBOLS: Record<string, string> = {
    AUD: "A$", USD: "US$", EUR: "€", GBP: "£", JPY: "¥",
    CNY: "¥", HKD: "HK$", SGD: "S$", THB: "฿", VND: "₫",
    MYR: "RM", IDR: "Rp", PHP: "₱", INR: "₹", TWD: "NT$",
    NZD: "NZ$", CAD: "C$", CHF: "Fr", TRY: "₺", BRL: "R$",
    AED: "AED", SAR: "SAR", KWD: "KD",
};

const CURRENCY_FLAGS: Record<string, string> = {
    AUD: "🇦🇺", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    CNY: "🇨🇳", HKD: "🇭🇰", SGD: "🇸🇬", THB: "🇹🇭", VND: "🇻🇳",
    MYR: "🇲🇾", IDR: "🇮🇩", PHP: "🇵🇭", INR: "🇮🇳", TWD: "🇹🇼",
    NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭", TRY: "🇹🇷", BRL: "🇧🇷",
    AED: "🇦🇪", SAR: "🇸🇦", KWD: "🇰🇼",
};

export function ExchangeRateWidget() {
    const [currency, setCurrency] = useState<string>("AUD");
    const [rate, setRate] = useState<number | null>(null);
    const [prevRate, setPrevRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStale, setIsStale] = useState(false);
    const { t } = useTranslation();

    const loadRate = useCallback(async (cur: string) => {
        setLoading(true);
        try {
            const result = await fetchExchangeRate(cur);
            // result가 null이면 환율을 전혀 알 수 없는 상태(캐시도 없음).
            // result가 있으면 신선/캐시 여부와 무관하게 보여주고 isStale 배지로 알린다.
            if (result) {
                setRate(prev => { setPrevRate(prev); return result.rate; });
                setIsStale(Boolean(result.isStale));
            } else {
                setIsStale(false);
            }
        } catch {
            // 네트워크 예외 시에도 기존에 보여주던 rate는 유지한다.
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("selectedCurrency") || "AUD";
        setCurrency(saved);
        loadRate(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const flag = CURRENCY_FLAGS[currency] || "💱";

    const formatRate = (r: number) =>
        r >= 1000 ? Math.round(r).toLocaleString() : r >= 1 ? r.toFixed(1) : r.toFixed(4);

    const trend = prevRate === null || rate === null || prevRate === rate
        ? null : rate > prevRate ? "up" : "down";

    return (
        <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-2.5 border">
            <div className="flex items-center gap-2 text-sm">
                <span>{flag}</span>
                <span className="text-muted-foreground">{symbol}1 =</span>
                {loading && rate === null ? (
                    <span className="text-muted-foreground text-xs">{t("dashboard.exchange.loading")}</span>
                ) : rate !== null ? (
                    <span className="font-bold">₩{formatRate(rate)}</span>
                ) : (
                    <span className="text-muted-foreground text-xs">{t("dashboard.exchange.failed")}</span>
                )}
                {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-red-500" />}
                {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-blue-500" />}
                {isStale && rate !== null && (
                    <span
                        title={t("dashboard.exchange.staleTooltip")}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 leading-none"
                    >
                        {t("dashboard.exchange.staleBadge")}
                    </span>
                )}
            </div>
            <button
                onClick={() => loadRate(currency)}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
        </div>
    );
}

"use client";

import Link from "next/link";
import { AlertTriangle, Clock, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface QuotaErrorBannerProps {
    type?: "daily" | "quota";
}

export function QuotaErrorBanner({ type = "quota" }: QuotaErrorBannerProps) {
    const { t } = useTranslation();

    if (type === "daily") {
        return (
            <div className="rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-700 px-4 py-3 space-y-1.5">
                <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                            {t("ai.banner.daily.title")}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed whitespace-pre-line">
                            {t("ai.banner.daily.desc")}
                        </p>
                    </div>
                </div>
                <Link href="/settings" className="block">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 h-8 text-xs border-orange-400 text-orange-800 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/40"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        {t("ai.banner.daily.cta")}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3 space-y-2">
            <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        {t("ai.banner.quota.title")}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed whitespace-pre-line">
                        {t("ai.banner.quota.desc")}
                    </p>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 dark:text-amber-200 underline mt-1"
                    >
                        {t("ai.banner.quota.studioLink")}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
            <Link href="/settings" className="block">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 h-8 text-xs border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/40"
                >
                    <Settings className="w-3.5 h-3.5" />
                    {t("ai.banner.quota.cta")}
                </Button>
            </Link>
        </div>
    );
}

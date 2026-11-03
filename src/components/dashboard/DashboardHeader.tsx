"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
    title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
    const { t, i18n } = useTranslation();
    const language = i18n.resolvedLanguage ?? i18n.language ?? "ko";
    const isEn = language.startsWith("en");

    return (
        <header className="flex items-center justify-between py-2 mb-0">
            <div className="flex-1 flex items-center gap-3">
                <Image
                    src="/logo.png"
                    alt="J여관"
                    width={250}
                    height={125}
                    className="h-24 w-auto"
                    priority
                />
                {title && (
                    <div className="text-xs text-muted-foreground flex flex-col ml-2">
                        <div className="flex items-center gap-1">
                            <span>{t("dashboard.header.power")}</span>
                            <span className="text-lg font-bold text-primary">J</span>
                            {!isEn && <span>{t("dashboard.header.of")}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            {isEn ? (
                                <span className="text-sm font-semibold text-primary">J Travel Planner</span>
                            ) : (
                                <>
                                    <span className="text-lg font-bold text-primary">여</span>
                                    <span>{t("dashboard.header.travel")}</span>
                                    <span className="text-lg font-bold text-primary">관</span>
                                    <span>{t("dashboard.header.manage")}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ThemeToggle />
        </header>
    );
}

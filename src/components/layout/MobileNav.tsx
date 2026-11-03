"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MapPin, BookOpen, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function MobileNav() {
    const pathname = usePathname();
    const { t, i18n } = useTranslation();
    const isEn = (i18n.resolvedLanguage ?? i18n.language ?? "ko").toLowerCase().startsWith("en");

    const navItems = [
        {
            label: t("nav.home"),
            compactLabel: "Home",
            href: "/",
            icon: Home,
        },
        {
            label: t("nav.schedule"),
            compactLabel: "Sched",
            href: "/schedule",
            icon: Calendar,
        },
        {
            label: t("nav.places"),
            compactLabel: "Places",
            href: "/places",
            icon: MapPin,
        },
        {
            label: t("nav.diary"),
            compactLabel: "Diary",
            href: "/diary",
            icon: BookOpen,
        },
        {
            label: t("nav.expenses"),
            compactLabel: "Spend",
            href: "/expenses",
            icon: CreditCard,
        },
        {
            label: t("nav.settings"),
            compactLabel: "Set",
            href: "/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="flex items-center justify-around h-16 w-full px-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex min-w-0 flex-1 flex-col items-center justify-center transition-colors",
                            !isActive && "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <div className={cn(
                            "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground"
                        )}>
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className={cn(
                                "block text-[10px] leading-none",
                                isActive ? "font-bold" : "font-normal"
                            )}>
                                {isEn ? item.compactLabel : item.label}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

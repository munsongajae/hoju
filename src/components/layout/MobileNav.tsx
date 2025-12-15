"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MapPin, CreditCard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: "홈",
            href: "/",
            icon: Home,
        },
        {
            label: "일정",
            href: "/schedule",
            icon: Calendar,
        },
        {
            label: "장소",
            href: "/places",
            icon: MapPin,
        },
        {
            label: "지출",
            href: "/expenses",
            icon: CreditCard,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-primary transition-colors"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-wide">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

interface DashboardHeaderProps {
    title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
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
                            <span>파워</span>
                            <span className="text-lg font-bold text-primary">J</span>
                            <span>들의</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-primary">여</span>
                            <span>행</span>
                            <span className="text-lg font-bold text-primary">관</span>
                            <span>리</span>
                        </div>
                    </div>
                )}
            </div>
            <ThemeToggle />
        </header>
    );
}

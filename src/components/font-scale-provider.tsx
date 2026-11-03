"use client";

import { useEffect } from "react";
import { applyFontScale, getSavedFontScaleOption } from "@/lib/fontScale";

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const savedOption = getSavedFontScaleOption();
        applyFontScale(savedOption);
    }, []);

    return <>{children}</>;
}

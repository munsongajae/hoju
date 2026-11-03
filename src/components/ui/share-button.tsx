"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { shareText } from "@/lib/shareUtils";

interface ShareButtonProps {
    /** 공유할 텍스트를 생성하는 함수 (필터 선택에 따라 달라질 수 있음) */
    generateText: () => string;
    /** 공유 제목 */
    title: string;
    /** 버튼 크기 */
    size?: "sm" | "icon" | "default";
    /** 버튼 variant */
    variant?: "ghost" | "outline" | "default" | "secondary";
    /** 추가 className */
    className?: string;
}

export function ShareButton({
    generateText,
    title,
    size = "icon",
    variant = "ghost",
    className,
}: ShareButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<"shared" | "copied" | null>(null);

    const handleShare = async () => {
        setLoading(true);
        try {
            const text = generateText();
            const outcome = await shareText(title, text);
            if (outcome === "shared" || outcome === "copied") {
                setResult(outcome);
                setTimeout(() => setResult(null), 2500);
            }
        } finally {
            setLoading(false);
        }
    };

    const icon = loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
    ) : result === "copied" ? (
        <Check className="w-4 h-4 text-green-500" />
    ) : result === "shared" ? (
        <Check className="w-4 h-4 text-blue-500" />
    ) : (
        <Share2 className="w-4 h-4" />
    );

    const label = result === "copied" ? "복사됨!" : result === "shared" ? "공유됨!" : null;

    if (size === "icon") {
        return (
            <Button
                variant={variant}
                size="icon"
                onClick={handleShare}
                disabled={loading}
                className={className}
                title="공유하기"
            >
                {icon}
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleShare}
            disabled={loading}
            className={`gap-1.5 ${className ?? ""}`}
        >
            {icon}
            {label ?? "공유"}
        </Button>
    );
}

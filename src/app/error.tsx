"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
            <h2 className="text-2xl font-bold">앗! 문제가 발생했습니다.</h2>
            <p className="text-muted-foreground">
                일시적인 오류일 수 있습니다. 다시 시도해주세요.
            </p>
            <Button onClick={() => reset()}>다시 시도</Button>
        </div>
    );
}

"use client";

import Link from "next/link";
import { CheckSquare, FileText, Calculator, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ExchangeRateCalculator } from "./ExchangeRateCalculator";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function QuickLinks() {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-2 gap-3 mt-6">
            <Link href="/checklist" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-teal-500" />
                <span className="text-sm font-medium">{t("dashboard.quick.checklist")}</span>
            </Link>

            <Link href="/memo" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <FileText className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <span className="text-sm font-medium">{t("dashboard.quick.memo")}</span>
            </Link>

            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center flex flex-col items-center justify-center">
                        <Calculator className="w-8 h-8 mb-2 text-green-500" />
                        <span className="text-sm font-medium">{t("dashboard.quick.rateCalc")}</span>
                    </div>
                </DialogTrigger>
                <DialogContent
                    className={cn(
                        "sm:max-w-md max-h-[min(90vh,100dvh-1rem)] overflow-y-auto",
                        // 하단 고정 광고(AdMob) + 키보드 오픈 시 입력/버튼이 가려지지 않도록 여유
                        "pb-[max(8rem,calc(env(safe-area-inset-bottom,0px)+7rem))]"
                    )}
                >
                    <DialogTitle className="sr-only">{t("dashboard.quick.rateCalc")}</DialogTitle>
                    <ExchangeRateCalculator />
                </DialogContent>
            </Dialog>

            <Link href="/report" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <BarChart2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <span className="text-sm font-medium">{t("dashboard.quick.report")}</span>
            </Link>
        </div>
    );
}

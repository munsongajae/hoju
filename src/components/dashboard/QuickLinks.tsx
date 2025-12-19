"use client";

import Link from "next/link";
import { CheckSquare, FileText, Calculator, Globe, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ExchangeRateCalculator } from "./ExchangeRateCalculator";

export function QuickLinks() {
    return (
        <div className="grid grid-cols-2 gap-3 mt-6">
            <Link href="/checklist" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-teal-500" />
                <span className="text-sm font-medium">체크리스트</span>
            </Link>

            <Link href="/memo" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <FileText className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <span className="text-sm font-medium">메모</span>
            </Link>

            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center flex flex-col items-center justify-center">
                        <Calculator className="w-8 h-8 mb-2 text-green-500" />
                        <span className="text-sm font-medium">환율 계산기</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">환율 계산기</DialogTitle>
                    <ExchangeRateCalculator />
                </DialogContent>
            </Dialog>

            <Link href="/travel-info" className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <span className="text-sm font-medium">여행정보</span>
            </Link>

            <Link href="/help" className="col-span-2 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors cursor-pointer text-center block">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <span className="text-sm font-medium">도움말</span>
            </Link>
        </div>
    );
}

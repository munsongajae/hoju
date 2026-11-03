import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeProvider } from "@/components/theme-provider";
import { TripProvider } from "@/contexts/TripContext";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { AdBanner } from "@/components/ads/AdBanner";
import { cn } from "@/lib/utils";
import { FontScaleProvider } from "@/components/font-scale-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AiModeProvider } from "@/components/ai-mode-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "J여관",
  description: "여행 가계부 & 일정 관리 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "J여관",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-zinc-50 dark:bg-zinc-950")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AiModeProvider>
              <FontScaleProvider>
                <TripProvider>
                  <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-foreground shadow-2xl overflow-hidden border-x border-border/50 pt-safe-area-inset-top">
                    <OfflineIndicator />
                    <main className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
                      {children}
                    </main>
                    <div className="fixed bottom-0 w-full max-w-md z-50 bg-background border-t border-border/50 pb-safe-area-inset-bottom">
                      <MobileNav />
                      <AdBanner position="bottom" />
                    </div>
                  </div>
                </TripProvider>
              </FontScaleProvider>
            </AiModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeProvider } from "@/components/theme-provider";
import { TripProvider } from "@/contexts/TripContext";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "J여관",
  description: "One month family trip usage",
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
          <TripProvider>
            <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-foreground shadow-2xl overflow-hidden border-x border-border/50">
              <main className="flex-1 overflow-y-auto pb-20">
                {children}
              </main>
              <MobileNav />
            </div>
          </TripProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

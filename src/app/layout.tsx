import { AppProviders } from "@/providers/app-providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { PageTitleManager } from "@/components/ui/page-title-manager";
import { Toaster } from "@/components/ui/sonner";

import { cn } from "@/lib/utils";

import "./globals.css";

export const preferredRegion = "fra1";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "CloneGPT",
        template: "%s | CloneGPT",
    },
    description: "CloneGPT is a chatbot that can help you with your questions.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-svh bg-zinc-950 text-zinc-50 antialiased",
                    geistSans.variable,
                    geistMono.variable,
                )}
            >
                <AppProviders>
                    <Suspense>
                        <PageTitleManager />
                    </Suspense>
                    {children}
                </AppProviders>
                <Toaster richColors position="top-right" duration={6_000} />
            </body>
        </html>
    );
}

"use client";

import * as React from "react";
import { useContext, useMemo } from "react";

import { Dialog } from "@/components/ui/dialog";

import type { Size } from "@/lib/types";

export const SearchDialogContext = React.createContext<{
    fullscreen: boolean | Size;
    isFullscreen: boolean;
    isFullscreenXs: boolean;
    isFullscreenSm: boolean;
    isFullscreenMd: boolean;
    isFullscreenLg: boolean;
    isFullscreenXl: boolean;
    isFullscreen2xl: boolean;
    isFullscreen3xl: boolean;
} | null>(null);

export function SearchDialog({
    fullscreen = false,
    ...props
}: React.ComponentProps<typeof Dialog> & { fullscreen?: boolean | Size }) {
    const value = useMemo(() => {
        return {
            fullscreen,
            isFullscreen: fullscreen === true,
            isFullscreenXs: fullscreen === "xs",
            isFullscreenSm: fullscreen === "sm",
            isFullscreenMd: fullscreen === "md",
            isFullscreenLg: fullscreen === "lg",
            isFullscreenXl: fullscreen === "xl",
            isFullscreen2xl: fullscreen === "2xl",
            isFullscreen3xl: fullscreen === "3xl",
        };
    }, [fullscreen]);

    return (
        <SearchDialogContext value={value}>
            <Dialog data-slot="search-dialog" {...props} />
        </SearchDialogContext>
    );
}

export function useSearchDialogContext() {
    const context = useContext(SearchDialogContext);
    if (!context) {
        throw new Error(
            "useSearchDialogContext must be used within a SearchDialogContext",
        );
    }
    return context;
}

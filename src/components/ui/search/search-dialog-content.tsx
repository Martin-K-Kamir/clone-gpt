"use client";

import * as React from "react";

import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

import { Search } from "./search";
import { useSearchDialogContext } from "./search-dialog";

export function SearchDialogContent({
    title = "Search",
    description = "Type to search...",
    showCloseButton = false,
    className,
    children,
}: React.ComponentProps<typeof DialogContent> & {
    title?: string;
    description?: string;
    showCloseButton?: boolean;
    className?: string;
    children?: React.ReactNode;
}) {
    const {
        isFullscreen,
        isFullscreenXs,
        isFullscreenSm,
        isFullscreenMd,
        isFullscreenLg,
        isFullscreenXl,
        isFullscreen2xl,
        isFullscreen3xl,
    } = useSearchDialogContext();

    return (
        <DialogContent
            className={cn(
                "overflow-hidden border border-zinc-700 p-0 sm:max-w-xl",
                isFullscreen &&
                    "!h-full !w-full !max-w-full rounded-none border-none",
                isFullscreenXs &&
                    "max-xs:!h-full max-xs:!w-full max-xs:!max-w-full max-xs:rounded-none max-xs:border-none",
                isFullscreenSm &&
                    "max-sm:!h-full max-sm:!w-full max-sm:!max-w-full max-sm:rounded-none max-sm:border-none",
                isFullscreenMd &&
                    "max-md:!h-full max-md:!w-full max-md:!max-w-full max-md:rounded-none max-md:border-none",
                isFullscreenLg &&
                    "max-lg:!h-full max-lg:!w-full max-lg:!max-w-full max-lg:rounded-none max-lg:border-none",
                isFullscreenXl &&
                    "max-xl:!h-full max-xl:!w-full max-xl:!max-w-full max-xl:rounded-none max-xl:border-none",
                className,
            )}
            classNameOverlay={cn(
                "bg-transparent backdrop-blur-none",
                isFullscreen && "!p-0",
                isFullscreenXs && "max-xs:!p-0",
                isFullscreenSm && "max-sm:!p-0",
                isFullscreenMd && "max-md:!p-0",
                isFullscreenLg && "max-lg:!p-0",
                isFullscreenXl && "max-xl:!p-0",
                isFullscreen2xl && "max-2xl:!p-0",
                isFullscreen3xl && "max-3xl:!p-0",
            )}
            showCloseButton={showCloseButton}
        >
            <DialogHeader className="sr-only">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <Search>{children}</Search>
        </DialogContent>
    );
}

"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useSearchDialogContext } from "./search-dialog";

export function SearchList({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
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
        <CommandPrimitive.List
            data-slot="search-list"
            className={cn(
                "h-[345px] max-h-[345px] scroll-py-2.5 overflow-y-auto overflow-x-hidden p-0 [&:has([cmdk-list-sizer]:not(:empty))]:p-2.5 [&>div]:space-y-2",
                isFullscreen && "h-full max-h-full",
                isFullscreenXs && "max-xs:h-full max-xs:max-h-full",
                isFullscreenSm && "max-sm:h-full max-sm:max-h-full",
                isFullscreenMd && "max-md:h-full max-md:max-h-full",
                isFullscreenLg && "max-lg:h-full max-lg:max-h-full",
                isFullscreenXl && "max-xl:h-full max-xl:max-h-full",
                isFullscreen2xl && "max-2xl:h-full max-2xl:max-h-full",
                isFullscreen3xl && "max-3xl:h-full max-3xl:max-h-full",
                className,
            )}
            {...props}
        />
    );
}

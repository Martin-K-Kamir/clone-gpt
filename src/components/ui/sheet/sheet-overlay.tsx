"use client";

import * as React from "react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

import { useSheetContext } from "./sheet";

export function SheetOverlay({
    className,
    onPointerDown,
    ...props
}: React.ComponentProps<"div">) {
    const { handleOpen, view } = useSheetContext();

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            onPointerDown?.(e);

            if (e.nativeEvent.isClickOutside) {
                return;
            }

            if (e.target === e.currentTarget) {
                handleOpen(false);
            }
        },
        [handleOpen, onPointerDown],
    );

    return (
        <div
            data-slot="sheet-overlay"
            data-state={view}
            className={cn(
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out data-[state=closed]:!pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
                className,
            )}
            onPointerDown={handlePointerDown}
            {...props}
        />
    );
}

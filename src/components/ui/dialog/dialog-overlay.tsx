"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useDialogContext } from "./dialog";

export function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    const { onOpenChange } = useDialogContext();
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 grid max-h-screen place-items-center overflow-y-auto bg-black/50 py-4 backdrop-blur-[1px] sm:py-8 lg:py-14",
                className,
            )}
            onClick={e => {
                if (e.target === e.currentTarget) {
                    onOpenChange(false);
                }
            }}
            {...props}
        />
    );
}

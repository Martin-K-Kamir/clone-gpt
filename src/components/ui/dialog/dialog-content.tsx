"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

import { DialogClose } from "./dialog-close";
import { DialogOverlay } from "./dialog-overlay";
import { DialogPortal } from "./dialog-portal";

export function DialogContent({
    className,
    classNameOverlay,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    classNameOverlay?: string;
}) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogOverlay className={classNameOverlay}>
                <DialogPrimitive.Content
                    data-slot="dialog-content"
                    className={cn(
                        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ocus-visible:ring-2 relative z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 py-6 shadow-lg outline-0 ring-zinc-50 duration-200 focus-visible:ring-2 sm:max-w-[min(100%-2rem,_var(--container-lg))] sm:p-6",
                        className,
                    )}
                    {...props}
                >
                    {children}
                    {showCloseButton && (
                        <DialogClose className="absolute right-4 top-4" />
                    )}
                </DialogPrimitive.Content>
            </DialogOverlay>
        </DialogPortal>
    );
}

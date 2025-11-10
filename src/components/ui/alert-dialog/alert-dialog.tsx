"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

import { useDialogState } from "@/hooks";

export function AlertDialog({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    const [open, onOpenChange] = useDialogState({
        ...props,
    });

    return (
        <AlertDialogPrimitive.Root
            data-slot="alert-dialog"
            open={open}
            onOpenChange={open => {
                onOpenChange?.(open);
                if (!open) {
                    const body = document.body;
                    if (body.style.pointerEvents === "none") {
                        body.style.pointerEvents = "";
                    }
                }
            }}
            {...props}
        />
    );
}

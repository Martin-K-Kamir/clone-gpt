"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useContext } from "react";

import { useDialogState } from "@/hooks";

export const DialogContext = createContext<{
    open: boolean | undefined;
    onOpenChange: (open: boolean) => void;
} | null>(null);

export function useDialogContext() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error(
            "useDialogContext must be used within a DialogProvider",
        );
    }
    return context;
}

export function Dialog({
    dialogId,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
    dialogId?: string;
}) {
    const [open, onOpenChange] = useDialogState({
        dialogId,
        ...props,
    });

    return (
        <DialogContext value={{ open, onOpenChange }}>
            <DialogPrimitive.Root
                data-slot="dialog"
                open={open}
                onOpenChange={open => {
                    onOpenChange(open);
                    if (!open) {
                        const body = document.body;
                        if (body.style.pointerEvents === "none") {
                            body.style.pointerEvents = "";
                        }
                    }
                }}
                {...props}
            />
        </DialogContext>
    );
}

"use client";

import { useCallback, useContext, useEffect, useState } from "react";

import { DialogsContext } from "@/components/ui/dialog";

import { usePrevious } from "./use-previous";

type UseDialogStateProps = {
    dialogId?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

function clearPointerEvents() {
    const body = document.body;
    if (body.style.pointerEvents === "none") {
        body.style.pointerEvents = "";
    }
}

export function useDialogState({
    dialogId,
    open: controlledOpen,
    defaultOpen,
    onOpenChange: controlledOnOpenChange,
}: UseDialogStateProps) {
    const { openDialogId, setOpenDialogId } = useContext(DialogsContext);

    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const open =
        controlledOpen !== undefined
            ? controlledOpen
            : openDialogId !== ""
              ? openDialogId === dialogId
              : internalOpen;

    const prevOpen = usePrevious(open);

    const onOpenChange = useCallback(
        (newOpen: boolean) => {
            controlledOnOpenChange?.(newOpen);

            if (dialogId) {
                setOpenDialogId(dialogId);
            }

            if (!newOpen && dialogId) {
                setOpenDialogId("");
            }

            if (controlledOpen === undefined) {
                setInternalOpen(newOpen);
            }
        },
        [dialogId, controlledOpen, controlledOnOpenChange, setOpenDialogId],
    );

    useEffect(() => {
        if (!open && typeof prevOpen === "boolean") {
            clearPointerEvents();

            setTimeout(() => {
                clearPointerEvents();
            }, 200);
        }
    }, [open, prevOpen]);

    return [open, onOpenChange] as const;
}

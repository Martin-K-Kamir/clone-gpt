"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { useContext } from "react";

import { DialogsContext } from "./dialogs";

export function DialogTrigger({
    dialogId,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
    dialogId?: string;
}) {
    const { setOpenDialogId } = useContext(DialogsContext);

    return (
        <DialogPrimitive.Trigger
            data-slot="dialog-trigger"
            {...props}
            onClick={e => {
                props.onClick?.(e);
                if (dialogId) {
                    setOpenDialogId(dialogId);
                }
            }}
        />
    );
}

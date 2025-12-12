"use client";

import { Button } from "@/components/ui/button";

import { SHEET_VIEW_STATE } from "./constants";
import { useSheetContext } from "./sheet";

export function SheetClose({
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { handleOpen, handleViewChange } = useSheetContext();

    return (
        <Button
            {...props}
            onClick={e => {
                onClick?.(e);
                handleViewChange(SHEET_VIEW_STATE.CLOSED);
                setTimeout(() => {
                    handleOpen(false);
                }, 250);
            }}
        />
    );
}

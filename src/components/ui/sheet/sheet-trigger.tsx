"use client";

import { Button } from "../button";
import { SHEET_VIEW_STATE } from "./constants";
import { useSheetContext } from "./sheet";

export function SheetTrigger({
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { handleOpen, handleViewChange } = useSheetContext();

    return (
        <Button
            {...props}
            onClick={e => {
                onClick?.(e);
                handleOpen(true);
                setTimeout(() => {
                    handleViewChange(SHEET_VIEW_STATE.OPEN);
                }, 50);
            }}
        />
    );
}

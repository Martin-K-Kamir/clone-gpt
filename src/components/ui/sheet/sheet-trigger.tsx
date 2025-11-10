"use client";

import * as React from "react";

import { Button } from "../button";
import { useSheetContext } from "./sheet";

export function SheetTrigger({
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { handleOpen } = useSheetContext();

    return (
        <Button
            {...props}
            onClick={e => {
                onClick?.(e);
                handleOpen(true);
            }}
        />
    );
}

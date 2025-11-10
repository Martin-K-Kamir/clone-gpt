"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import { useSheetContext } from "./sheet";

export function SheetClose({
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { handleOpen } = useSheetContext();

    return (
        <Button
            {...props}
            onClick={e => {
                onClick?.(e);
                handleOpen(false);
            }}
        />
    );
}

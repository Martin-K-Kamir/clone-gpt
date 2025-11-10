"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function SearchError({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="search-error"
            className={cn(
                "flex flex-col items-center gap-2 text-pretty py-6 text-center text-sm font-medium text-rose-400",
                className,
            )}
            {...props}
        />
    );
}

"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function SearchEmpty({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="search-empty"
            className={cn(
                "text-pretty py-6 text-center text-sm font-medium text-zinc-400",
                className,
            )}
            {...props}
        />
    );
}

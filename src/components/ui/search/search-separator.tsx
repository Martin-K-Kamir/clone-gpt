"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function SearchSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="search-separator"
            className={cn("-mx-3 my-2.5 h-px bg-zinc-700", className)}
            {...props}
        />
    );
}

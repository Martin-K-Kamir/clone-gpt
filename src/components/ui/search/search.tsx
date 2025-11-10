"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Search({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive> & {}) {
    return (
        <CommandPrimitive
            shouldFilter={false}
            data-slot="search"
            className={cn(
                "group/search flex h-full w-full flex-col overflow-hidden rounded-xl text-zinc-50 outline-0 [&:has([data-slot='search-separator'])>[data-slot='search-list']]:![scrollbar-color:auto]",
                className,
            )}
            {...props}
        />
    );
}

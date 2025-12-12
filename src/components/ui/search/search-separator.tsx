"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function SearchSeparator({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="search-separator"
            role="none"
            className={cn("-mx-3 my-2.5 h-px bg-zinc-700", className)}
            {...props}
        />
    );
}

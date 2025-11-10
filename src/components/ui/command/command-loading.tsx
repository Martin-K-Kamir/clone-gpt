"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function CommandLoading({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
    return (
        <CommandPrimitive.Loading
            data-slot="command-loading"
            className={cn("text-zinc-400", className)}
            {...props}
        >
            Loading...
        </CommandPrimitive.Loading>
    );
}

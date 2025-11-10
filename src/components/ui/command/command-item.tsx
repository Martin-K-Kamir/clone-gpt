"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

export function CommandItem({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "outline-hidden relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm data-[selected=true]:bg-zinc-700/60 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-400 [&_svg]:shrink-0",
                className,
            )}
            {...props}
        />
    );
}

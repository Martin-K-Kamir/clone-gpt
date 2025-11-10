"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { cn } from "@/lib/utils";

export function DropdownMenuItem({
    className,
    inset,
    variant = "default",
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
}) {
    return (
        <DropdownMenuPrimitive.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "outline-hidden 2lg:min-h-8 relative flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm focus:bg-zinc-700/60 focus:text-zinc-50 data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-rose-400 data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-rose-600/15 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-300 data-[variant=destructive]:[&_svg:not([class*='text-'])]:text-red-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className,
            )}
            {...props}
        />
    );
}

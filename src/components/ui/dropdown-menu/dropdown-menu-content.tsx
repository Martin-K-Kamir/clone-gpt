"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { cn } from "@/lib/utils";

export function DropdownMenuContent({
    className,
    sideOffset = 4,
    portalProps,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
    portalProps?: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>;
}) {
    return (
        <DropdownMenuPrimitive.Portal {...portalProps}>
            <DropdownMenuPrimitive.Content
                data-slot="dropdown-menu-content"
                sideOffset={sideOffset}
                className={cn(
                    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-xl border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-50 shadow-md",
                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

"use client";

import { IconSearch } from "@tabler/icons-react";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CommandInput({
    showCloseButton = false,
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
    showCloseButton?: boolean;
}) {
    return (
        <div
            data-slot="command-input-wrapper"
            className="flex h-12 items-center gap-2 border-b border-zinc-700 px-5"
        >
            <IconSearch className="size-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    "placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md bg-transparent py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
            {showCloseButton && <DialogClose className="ml-auto" />}
        </div>
    );
}

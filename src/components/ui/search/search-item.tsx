"use client";

import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";
import * as React from "react";
import { startTransition, useContext } from "react";

import { DialogContext } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

export function SearchItem({
    itemId,
    href,
    className,
    onSelect,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
    itemId: string;
    href?: string;
}) {
    const router = useRouter();
    const dialogContext = useContext(DialogContext);

    function handleSelect(value: string) {
        dialogContext?.onOpenChange(false);
        onSelect?.(value);

        if (href && window.location.pathname !== href) {
            startTransition(() => {
                router.push(href);
            });
        }
    }

    return (
        <CommandPrimitive.Item
            data-slot="search-item"
            className={cn(
                "outline-hidden group/search-item relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm data-[selected=true]:bg-zinc-700/60 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-400 [&_svg]:shrink-0",
                className,
            )}
            value={itemId}
            onSelect={handleSelect}
            {...props}
        />
    );
}

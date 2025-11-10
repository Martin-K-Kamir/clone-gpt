"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils/index";

function Switch({
    className,
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "shadow-xs peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-zinc-700 outline-none transition-all focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-zinc-800",
                className,
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    // "pointer-events-none block size-4 rounded-full bg-zinc-950 ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-50",
                    "pointer-events-none block size-4 rounded-full bg-zinc-50 ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-zinc-50",
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };

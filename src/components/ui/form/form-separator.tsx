"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function FormSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="form-separator"
            data-content={!!children}
            className={cn(
                "relative flex h-5 items-center gap-0.5 text-sm group-data-[variant=outline]/form-group:-mb-2",
                className,
            )}
            {...props}
        >
            <span className="h-px w-full bg-zinc-700" />
            {children && (
                <span
                    className="relative mx-auto block w-fit flex-shrink-0 bg-transparent px-2 text-zinc-400"
                    data-slot="form-separator-content"
                >
                    {children}
                </span>
            )}
            <span className="h-px w-full bg-zinc-700" />
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function DataTableButton({
    variant = "outline",
    className,
    ...props
}: React.ComponentProps<typeof Button>) {
    return (
        <Button
            className={cn(
                "size-8 border-zinc-700 hover:bg-zinc-700/60",
                className,
            )}
            variant={variant}
            {...props}
        />
    );
}

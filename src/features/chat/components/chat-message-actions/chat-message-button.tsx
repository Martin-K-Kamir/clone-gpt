"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const defaultTooltipContentProps = {
    side: "bottom",
    sideOffset: 5,
    className: "bg-zinc-800",
} as const;

const defaultTooltipProps = {
    disableHoverableContent: true,
} as const;

export function ChatMessageButton({
    ref,
    variant = "ghost",
    size = "icon",
    tooltipContentProps,
    tooltipProps,
    className,
    disabled,
    ...props
}: React.ComponentProps<typeof Button>) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
        <Button
            ref={ref || buttonRef}
            variant={variant}
            size={size}
            className={cn("size-8 disabled:opacity-100", className)}
            disabled={disabled}
            tooltipContentProps={{
                ...defaultTooltipContentProps,
                ...tooltipContentProps,
            }}
            tooltipProps={{
                ...defaultTooltipProps,
                ...tooltipProps,
            }}
            {...props}
        />
    );
}

"use client";

import { IconPlayerStopFilled } from "@tabler/icons-react";
import { ChatStatus } from "ai";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PromptComposerVariants } from "./prompt-composer";

export type PromptComposerStopButtonProps = {
    className?: string;
    status?: ChatStatus;
    formVariant?: PromptComposerVariants;
    isVisible: boolean;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PromptComposerStopButton({
    className,
    status,
    formVariant,
    isVisible,
    size = "icon",
    type = "button",
    variant = "secondary",
    ...props
}: PromptComposerStopButtonProps) {
    if (
        (status !== "streaming" && status !== "submitted") ||
        formVariant !== "submit" ||
        !isVisible
    ) {
        return null;
    }

    return (
        <Button
            type={type}
            size={size}
            variant={variant}
            className={cn(
                "z-30 size-8 rounded-full disabled:cursor-not-allowed",
                className,
            )}
            {...props}
        >
            <IconPlayerStopFilled className="size-4" />
            <span className="sr-only">Stop</span>
        </Button>
    );
}

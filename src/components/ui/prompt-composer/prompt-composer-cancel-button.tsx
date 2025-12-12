"use client";

import { ChatStatus } from "ai";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { PromptComposerVariants } from "./prompt-composer";

export type PromptComposerCancelButtonProps = {
    formVariant: PromptComposerVariants;
    status?: ChatStatus;
    isVisible: boolean;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PromptComposerCancelButton({
    className,
    formVariant,
    isVisible,
    type = "button",
    size = "sm",
    variant = "ghost",
    ...props
}: PromptComposerCancelButtonProps) {
    if (formVariant !== "update" || !isVisible) {
        return null;
    }

    return (
        <Button
            type={type}
            size={size}
            variant={variant}
            className={cn(
                "z-30 rounded-full disabled:cursor-not-allowed",
                className,
            )}
            {...props}
        >
            Cancel
        </Button>
    );
}

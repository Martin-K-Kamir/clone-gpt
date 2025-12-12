"use client";

import { ChatStatus } from "ai";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { PromptComposerVariants } from "./prompt-composer";

export type PromptComposerUpdateButtonProps = {
    formVariant: PromptComposerVariants;
    isVisible: boolean;
    status?: ChatStatus;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PromptComposerUpdateButton({
    className,
    formVariant,
    disabled,
    isVisible,
    type = "submit",
    size = "sm",
    ...props
}: PromptComposerUpdateButtonProps) {
    if (formVariant !== "update" || !isVisible) {
        return null;
    }

    return (
        <Button
            type={type}
            size={size}
            disabled={disabled}
            className={cn(
                "z-30 rounded-full disabled:cursor-not-allowed",
                className,
            )}
            {...props}
        >
            Update
        </Button>
    );
}

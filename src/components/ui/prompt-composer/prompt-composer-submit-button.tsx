"use client";

import { IconSend } from "@tabler/icons-react";
import { ChatStatus } from "ai";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { PromptComposerVariants } from "./prompt-composer";

export type PromptComposerSubmitButtonProps = {
    className?: string;
    status?: ChatStatus;
    formVariant?: PromptComposerVariants;
    isVisible: boolean;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PromptComposerSubmitButton({
    className,
    status,
    formVariant,
    type = "submit",
    size = "icon",
    isVisible,
    ...props
}: PromptComposerSubmitButtonProps) {
    if (
        status === "submitted" ||
        status === "streaming" ||
        formVariant !== "submit" ||
        !isVisible
    ) {
        return null;
    }

    return (
        <Button
            type={type}
            size={size}
            className={cn(
                "z-30 size-8 rounded-full disabled:cursor-not-allowed",
                className,
            )}
            {...props}
        >
            <IconSend className="size-4" />
            <span className="sr-only">Send</span>
        </Button>
    );
}

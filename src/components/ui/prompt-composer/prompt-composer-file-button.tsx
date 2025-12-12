"use client";

import { IconPaperclip } from "@tabler/icons-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { PromptComposerVariants } from "./prompt-composer";

export type PromptComposerFileButtonProps = {
    disabled: boolean;
    className?: string;
    formVariant: PromptComposerVariants;
    isVisible: boolean;
    acceptedFileTypes?: readonly string[];
    multipleFiles?: boolean;
    maxFileSize?: number;
    onFileSelect?: (files: File[]) => void;
} & Omit<React.ComponentProps<typeof Button>, "children">;

export function PromptComposerFileButton({
    disabled,
    className,
    formVariant,
    isVisible,
    acceptedFileTypes,
    multipleFiles,
    maxFileSize,
    type = "button",
    size = "icon",
    variant = "ghost",
    onFileSelect,
    onClick,
    ...props
}: PromptComposerFileButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isVisible || formVariant !== "submit") {
        return null;
    }

    return (
        <>
            <Button
                type={type}
                size={size}
                variant={variant}
                className={cn(
                    "z-30 size-8 rounded-full disabled:cursor-not-allowed",
                    className,
                )}
                onClick={e => {
                    onClick?.(e);
                    if (disabled) {
                        return;
                    }
                    fileInputRef.current?.click();
                }}
                tooltip="Attach a file"
                tooltipContentProps={{
                    side: "bottom",
                    className: "bg-zinc-800",
                    sideOffset: 5,
                }}
                disabled={disabled}
                {...props}
            >
                <IconPaperclip className="size-4 text-zinc-200" />
                <span className="sr-only">Attach a file</span>
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                multiple={multipleFiles}
                accept={acceptedFileTypes?.join(",")}
                max={maxFileSize}
                className="hidden"
                onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                        onFileSelect?.(Array.from(e.target.files));
                        e.target.value = "";
                    }
                }}
            />
        </>
    );
}

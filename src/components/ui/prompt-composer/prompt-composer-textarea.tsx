"use client";

import { useEffect, useId } from "react";
import { useMediaQuery } from "usehooks-ts";

import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

export type PromptComposerTextareaProps = {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    autoFocus: boolean;
    onFilePaste?: (files: File[]) => void;
} & Omit<React.ComponentProps<typeof Textarea>, "children" | "ref">;

export function PromptComposerTextarea({
    buttonRef,
    className,
    disabled,
    textareaRef,
    autoFocus,
    onChange,
    onKeyDown,
    onFilePaste,
    ...props
}: PromptComposerTextareaProps) {
    const id = useId();
    const isMouse = useMediaQuery("(pointer: fine)", {
        defaultValue: false,
    });

    useEffect(() => {
        if (autoFocus && isMouse) {
            textareaRef.current?.focus?.();
        }
    }, [autoFocus, isMouse, textareaRef]);

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData.items;
        const files = Array.from(items)
            .map(item => item.getAsFile())
            .filter(file => file !== null);
        onFilePaste?.(files);
    };

    return (
        <>
            <label htmlFor={`${id}-prompt-input`} className="sr-only">
                Prompt Input
            </label>
            <Textarea
                {...props}
                ref={textareaRef}
                id={`${id}-prompt-input`}
                name="prompt-input"
                className={cn(
                    "max-h-72 min-h-1 resize-none border-none bg-transparent p-1.5 leading-normal outline-none !ring-0",
                    className,
                )}
                autoComplete="off"
                onPaste={handlePaste}
                onChange={e => {
                    onChange?.(e);
                    if (textareaRef && textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                }}
                onKeyDown={e => {
                    onKeyDown?.(e);
                    if (e.key === "Enter" && !e.shiftKey) {
                        if (buttonRef.current && !disabled) {
                            e.preventDefault();
                            buttonRef.current.click();

                            if (textareaRef.current) {
                                textareaRef.current.style.height = "auto";
                            }
                        }
                    }
                }}
            />
        </>
    );
}

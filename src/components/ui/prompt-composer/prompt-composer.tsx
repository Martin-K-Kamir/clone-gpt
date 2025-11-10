"use client";

import { ChatStatus } from "ai";
import { useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { PromptComposerCancelButton } from "./prompt-composer-cancel-button";
import { PromptComposerFileButton } from "./prompt-composer-file-button";
import { PromptComposerStopButton } from "./prompt-composer-stop-button";
import { PromptComposerSubmitButton } from "./prompt-composer-submit-button";
import { PromptComposerTextarea } from "./prompt-composer-textarea";
import { PromptComposerUpdateButton } from "./prompt-composer-update-button";

export type PromptComposerVariants = "submit" | "update";

export type PromptComposerBaseProps = {
    value?: string;
    variant?: PromptComposerVariants;
    defaultValue?: string;
    placeholder?: string;
    acceptedFileTypes?: readonly string[];
    multipleFiles?: boolean;
    maxFileSize?: number;
    status?: ChatStatus;
    classNameTextarea?: string;
    min?: number;
    max?: number;
    autoFocus?: boolean;
    disabled?: boolean;
    disabledFileButton?: boolean;
    limitToSubmit?: number;
    textareaProps?: React.ComponentProps<typeof Textarea>;
    resetOnSubmit?: boolean;
    isFileButtonVisible?: boolean;
    isSubmitButtonVisible?: boolean;
    isStopButtonVisible?: boolean;
    isCancelButtonVisible?: boolean;
    isUpdateButtonVisible?: boolean;
    isLoadingFiles?: boolean;
    onSubmit?: (text: string) => void;
    onFileSelect?: (files: File[]) => void;
    onFilePaste?: (files: File[]) => void;
    onCancel?: () => void;
    onStop?: () => void;
};

export type PromptComposerProps = PromptComposerBaseProps &
    Omit<React.ComponentProps<"form">, "onChange" | "onSubmit">;

export function PromptComposer({
    min,
    max,
    status,
    value,
    className,
    classNameTextarea,
    textareaProps,
    acceptedFileTypes,
    maxFileSize,
    variant = "submit",
    placeholder = "Send a message...",
    multipleFiles = false,
    disabled = false,
    disabledFileButton = false,
    autoFocus = true,
    resetOnSubmit = true,
    isFileButtonVisible = true,
    isSubmitButtonVisible = true,
    isStopButtonVisible = true,
    isCancelButtonVisible = true,
    isUpdateButtonVisible = true,
    onCancel,
    onStop,
    onSubmit,
    onFileSelect,
    onFilePaste,
    ...props
}: PromptComposerProps) {
    const [input, setInput] = useState(value ?? "");
    const primaryButtonRef = useRef<HTMLButtonElement>(null);
    const fileButtonRef = useRef<HTMLButtonElement>(null);
    const secondaryButtonRef = useRef<HTMLButtonElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isSubmitDisabled =
        disabled ||
        (min !== undefined && input.trim().length < min) ||
        (max !== undefined && input.trim().length > max);

    return (
        <form
            className={cn(
                "bg-zinc-925 cursor-text rounded-3xl border border-zinc-700 p-3",
                className,
            )}
            onClick={e => {
                if (
                    e.target === primaryButtonRef.current ||
                    e.target === secondaryButtonRef.current
                ) {
                    return;
                }

                textareaRef.current?.focus?.();
            }}
            onSubmit={e => {
                e.preventDefault();

                if (isSubmitDisabled) {
                    return;
                }

                onSubmit?.(input);

                if (resetOnSubmit) {
                    setInput("");
                }
            }}
            {...props}
        >
            <PromptComposerTextarea
                textareaRef={textareaRef}
                buttonRef={primaryButtonRef}
                className={classNameTextarea}
                disabled={isSubmitDisabled}
                placeholder={placeholder}
                value={input}
                autoFocus={autoFocus}
                onFilePaste={onFilePaste}
                onChange={e => {
                    setInput(e.target.value);
                }}
                {...textareaProps}
            />

            <div className="flex justify-end gap-2 pt-3.5">
                <PromptComposerFileButton
                    ref={fileButtonRef}
                    disabled={disabledFileButton}
                    isVisible={isFileButtonVisible}
                    formVariant={variant}
                    multipleFiles={multipleFiles}
                    maxFileSize={maxFileSize}
                    className="mr-auto"
                    acceptedFileTypes={acceptedFileTypes}
                    onFileSelect={onFileSelect}
                />

                <PromptComposerSubmitButton
                    ref={primaryButtonRef}
                    status={status}
                    formVariant={variant}
                    disabled={isSubmitDisabled}
                    isVisible={isSubmitButtonVisible}
                />

                <PromptComposerStopButton
                    ref={primaryButtonRef}
                    status={status}
                    formVariant={variant}
                    isVisible={isStopButtonVisible}
                    onClick={onStop}
                />

                <PromptComposerCancelButton
                    ref={secondaryButtonRef}
                    formVariant={variant}
                    status={status}
                    onClick={onCancel}
                    isVisible={isCancelButtonVisible}
                />

                <PromptComposerUpdateButton
                    ref={primaryButtonRef}
                    status={status}
                    formVariant={variant}
                    disabled={isSubmitDisabled}
                    isVisible={isUpdateButtonVisible}
                />
            </div>
        </form>
    );
}

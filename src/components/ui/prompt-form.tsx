"use client";

import {
    IconPaperclip,
    IconPlayerStopFilled,
    IconSend,
} from "@tabler/icons-react";
import { ChatStatus } from "ai";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type PromptFormVariants = "submit" | "update";

export type PromptFormProps = {
    value?: string;
    variant?: PromptFormVariants;
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
    onFileSelect?: (files: FileList) => void;
    onFileRemove?: (file: File) => void;
    onCancel?: () => void;
    onStop?: () => void;
};

export function PromptForm({
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
    ...props
}: PromptFormProps &
    Omit<React.ComponentProps<"form">, "onChange" | "onSubmit">) {
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
            <PromptFormTextarea
                textareaRef={textareaRef}
                buttonRef={primaryButtonRef}
                className={classNameTextarea}
                disabled={isSubmitDisabled}
                placeholder={placeholder}
                value={input}
                autoFocus={autoFocus}
                onChange={e => {
                    setInput(e.target.value);
                }}
                {...textareaProps}
            />

            <div className="flex justify-end gap-2 pt-3.5">
                <PromptFormFileButton
                    ref={fileButtonRef}
                    status={status}
                    disabled={disabled}
                    isVisible={isFileButtonVisible}
                    formVariant={variant}
                    multipleFiles={multipleFiles}
                    maxFileSize={maxFileSize}
                    className="mr-auto"
                    acceptedFileTypes={acceptedFileTypes}
                    onFileSelect={onFileSelect}
                />

                <PromptFormSubmitButton
                    ref={primaryButtonRef}
                    status={status}
                    formVariant={variant}
                    disabled={isSubmitDisabled}
                    isVisible={isSubmitButtonVisible}
                />

                <PromptFormStopButton
                    ref={primaryButtonRef}
                    status={status}
                    formVariant={variant}
                    onClick={onStop}
                    disabled={isSubmitDisabled}
                    isVisible={isStopButtonVisible}
                />

                <PromptFormCancelButton
                    ref={secondaryButtonRef}
                    formVariant={variant}
                    onClick={onCancel}
                    isVisible={isCancelButtonVisible}
                />

                <PromptFormUpdateButton
                    ref={primaryButtonRef}
                    formVariant={variant}
                    disabled={isSubmitDisabled}
                    isVisible={isUpdateButtonVisible}
                />
            </div>
        </form>
    );
}

function PromptFormSubmitButton({
    className,
    status,
    formVariant,
    type = "submit",
    size = "icon",
    isVisible,
    ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
    status?: ChatStatus;
    formVariant?: PromptFormVariants;
    isVisible: boolean;
}) {
    if (
        status === "ready" ||
        status === "error" ||
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

function PromptFormFileButton({
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
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
    status?: ChatStatus;
    isVisible: boolean;
    formVariant?: PromptFormVariants;
    acceptedFileTypes?: readonly string[];
    multipleFiles?: boolean;
    maxFileSize?: number;
    onFileSelect?: (files: FileList) => void;
}) {
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
                        onFileSelect?.(e.target.files);
                    }
                }}
            />
        </>
    );
}

function PromptFormStopButton({
    className,
    status,
    formVariant,
    isVisible,
    size = "icon",
    type = "button",
    variant = "secondary",
    ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
    status?: ChatStatus;
    formVariant?: PromptFormVariants;
    isVisible: boolean;
}) {
    if (status !== "streaming" || formVariant !== "submit" || !isVisible) {
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

function PromptFormCancelButton({
    className,
    formVariant,
    isVisible,
    type = "button",
    size = "sm",
    variant = "ghost",
    ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
    formVariant: PromptFormVariants;
    isVisible: boolean;
}) {
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

function PromptFormUpdateButton({
    className,
    formVariant,
    disabled,
    isVisible,
    type = "submit",
    size = "sm",
    ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
    formVariant: PromptFormVariants;
    isVisible: boolean;
}) {
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

type PromptFormTextareaProps = {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    autoFocus: boolean;
} & Omit<React.ComponentProps<typeof Textarea>, "children" | "ref">;

function PromptFormTextarea({
    buttonRef,
    className,
    disabled,
    textareaRef,
    autoFocus,
    onChange,
    onKeyDown,
    ...props
}: PromptFormTextareaProps) {
    const id = useId();

    useEffect(() => {
        if (autoFocus) {
            textareaRef.current?.focus?.();
        }
    }, [autoFocus, textareaRef]);

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
                    "max-h-72 min-h-1 resize-none border-none bg-transparent p-1 leading-normal outline-none !ring-0",
                    className,
                )}
                autoComplete="off"
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

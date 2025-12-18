import React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useCopyToClipboard } from "@/hooks";

import { CopyInputButton } from "./copy-input-button";

type CopyInputProps = {
    value: string;
    label?: React.ReactNode;
    copyResetDelay?: number;
    labelProps?: Omit<React.ComponentProps<"label">, "children">;
    inputProps?: Omit<React.ComponentProps<"input">, "value" | "onChange">;
    disabled?: boolean;
    onCopy?: (value: string) => void;
    onCopyError?: (message: string) => void;
} & Omit<React.ComponentProps<"div">, "children"> &
    Omit<React.ComponentProps<typeof CopyInputButton>, "handleCopy" | "copied">;

export function CopyInput({
    value,
    children,
    className,
    labelProps,
    buttonProps,
    inputProps,
    copyResetDelay,
    copyIcon,
    copiedIcon,
    copyText,
    copiedText,
    showIcon,
    iconPosition,
    disabled,
    label = "Copy value to clipboard",
    onCopyError,
    onCopy,
    ...props
}: CopyInputProps) {
    const { copied, copy } = useCopyToClipboard({
        copyResetDelay,
        onError: message => {
            toast.error(message);
            onCopyError?.(message);
        },
    });

    const handleCopy = () => {
        copy(value);
        onCopy?.(value);
    };

    return (
        <div
            className={cn(
                "flex items-center gap-4 rounded-xl border border-zinc-700 py-2 pl-3 pr-2",
                className,
            )}
            {...props}
        >
            <label className="sr-only" {...labelProps} htmlFor="copy-input">
                {label}
            </label>
            <input
                id="copy-input"
                type="text"
                value={value}
                className={cn(
                    "w-full select-all bg-transparent text-sm text-zinc-50 outline-none",
                    inputProps?.className,
                )}
                disabled={disabled}
                {...inputProps}
                readOnly
            />
            <CopyInputButton
                disabled={disabled}
                copied={copied}
                copyIcon={copyIcon}
                copiedIcon={copiedIcon}
                copyText={copyText}
                copiedText={copiedText}
                buttonProps={buttonProps}
                showIcon={showIcon}
                iconPosition={iconPosition}
                handleCopy={handleCopy}
            >
                {children}
            </CopyInputButton>
        </div>
    );
}

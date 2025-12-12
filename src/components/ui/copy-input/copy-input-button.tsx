import { IconCheck, IconCopy } from "@tabler/icons-react";
import React from "react";

import { Button } from "@/components/ui/button";

export type CopyInputButtonProps = {
    copied: boolean;
    copyIcon?: React.ReactNode;
    copiedIcon?: React.ReactNode;
    copyText?: React.ReactNode;
    copiedText?: React.ReactNode;
    buttonProps?: Omit<React.ComponentProps<typeof Button>, "children">;
    showIcon?: boolean;
    iconPosition?: "left" | "right";
    children?:
        | React.ReactNode
        | ((handleCopy: () => void, copied: boolean) => React.ReactNode);
    handleCopy: () => void;
};

export function CopyInputButton({
    children,
    copied,
    buttonProps,
    copyIcon = <IconCopy />,
    copiedIcon = <IconCheck />,
    showIcon = true,
    copyText = "Copy",
    copiedText = "Copied",
    iconPosition = "left",
    handleCopy,
}: CopyInputButtonProps) {
    // If children is a function, call it with handleCopy
    if (typeof children === "function") {
        return <>{children(handleCopy, copied)}</>;
    }

    // If children is provided and is a React element, clone it with onClick
    if (children && React.isValidElement(children)) {
        const element = children as React.ReactElement<{
            onClick?: (e: React.MouseEvent) => void;
        }>;
        const existingOnClick = element.props.onClick;

        return React.cloneElement(element, {
            onClick: (e: React.MouseEvent) => {
                // Call the existing onClick if present, then copy
                existingOnClick?.(e);
                handleCopy();
            },
        });
    }

    // If children is provided but not a React element, render as-is
    if (children) {
        return children;
    }

    return (
        <Button
            size="sm"
            {...buttonProps}
            onClick={e => {
                buttonProps?.onClick?.(e);
                handleCopy();
            }}
            disabled={copied}
        >
            {showIcon &&
                iconPosition === "left" &&
                (copied ? copiedIcon : copyIcon)}
            {copied ? copiedText : copyText}
            {showIcon &&
                iconPosition === "right" &&
                (copied ? copiedIcon : copyIcon)}
        </Button>
    );
}

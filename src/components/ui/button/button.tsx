import { Slot } from "@radix-ui/react-slot";
import { IconLoader2 } from "@tabler/icons-react";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { buttonVariants } from "./button-variants";

export type ButtonProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        as?: React.ElementType;
        styled?: boolean;
        isLoading?: boolean;
        loadingIcon?: React.ReactNode;
        loadingIconClassName?: string;
        tooltip?: React.ReactNode;
        tooltipProps?: React.ComponentProps<typeof Tooltip>;
        tooltipContentProps?: React.ComponentProps<typeof TooltipContent>;
    };

export function Button({
    styled = true,
    asChild = false,
    as: As,
    tooltipProps = {
        delayDuration: 0,
    },
    tooltipContentProps = {
        side: "top",
    },
    className,
    variant,
    size,
    isLoading,
    loadingIcon,
    loadingIconClassName,
    children,
    tooltip,
    ...props
}: ButtonProps) {
    if (As) {
        return <As {...props} />;
    }

    const _loadingIcon = loadingIcon ?? (
        <IconLoader2
            data-slot="loading-icon"
            className={cn("absolute size-4 animate-spin", loadingIconClassName)}
        />
    );

    const Comp = asChild ? Slot : "button";

    const button = (
        <Comp
            data-slot="button"
            className={cn(
                styled
                    ? buttonVariants({ variant, size, className })
                    : className,
            )}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="opacity-0">{children}</span>
                    {_loadingIcon}
                </>
            ) : (
                children
            )}
        </Comp>
    );

    if (tooltip) {
        return (
            <Tooltip {...tooltipProps}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                {tooltip && (
                    <TooltipContent {...tooltipContentProps}>
                        {tooltip}
                    </TooltipContent>
                )}
            </Tooltip>
        );
    }

    return button;
}

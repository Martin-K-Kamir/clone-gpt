"use client";

import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { useSidebarContext } from "./sidebar-provider";

export const sidebarMenuButtonVariants = cva(
    "peer/menu-button cursor-pointer inline-flex w-full items-center gap-2 overflow-hidden rounded-lg p-2.5 text-left data-[state=open]:bg-zinc-800/70 text-sm outline-hidden [&_svg:not([class*='text-'])]:text-zinc-400 ring-blue-500 focus-visible:bg-zinc-800/70 transition-[width,height,padding] hover:bg-zinc-800/70 hover:text-zinc-50 focus-visible:ring-2 active:bg-zinc-800/80 disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-zinc-800/90 data-[state=open]:hover:bg-zinc-800 data-[state=open]:hover:text-zinc-50 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! min-h-10 2lg:min-h-9 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
        variants: {
            size: {
                default: "h-9 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
            },
        },
        defaultVariants: {
            size: "default",
        },
    },
);

type SidebarMenuButtonProps = {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants> &
    React.ComponentProps<"button">;

export function SidebarMenuButton({
    tooltip,
    className,
    size = "default",
    isActive = false,
    asChild = false,
    ...props
}: SidebarMenuButtonProps) {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebarContext();

    const button = (
        <Comp
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ size }), className)}
            {...props}
        />
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== "collapsed" || isMobile}
                {...tooltip}
            />
        </Tooltip>
    );
}

"use client";

import { PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useSidebarContext } from "./sidebar-provider";

export function SidebarTrigger({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { toggleSidebar } = useSidebarContext();

    return (
        <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            data-testid="sidebar-trigger-button"
            variant="ghost"
            size="icon"
            className={cn("size-8", className)}
            onClick={event => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
}

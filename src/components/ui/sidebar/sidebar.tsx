"use client";

import { SHEET_VIEW_STATE, Sheet, SheetContent } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

import { SIDEBAR_WIDTH_MOBILE } from "./constants";
import { useSidebarContext } from "./sidebar-provider";

type SidebarProps = {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
} & React.ComponentProps<"div">;

export function Sidebar({
    className,
    children,
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    ...props
}: SidebarProps) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebarContext();

    if (collapsible === "none") {
        return (
            <div
                data-slot="sidebar"
                className={cn(
                    "w-(--sidebar-width) flex h-full flex-col bg-zinc-950 text-zinc-50",
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet
                open
                view={
                    openMobile ? SHEET_VIEW_STATE.OPEN : SHEET_VIEW_STATE.CLOSED
                }
                onViewChange={view => {
                    console.log("onViewChange", view);
                    if (view === SHEET_VIEW_STATE.OPEN) {
                        setOpenMobile(true);
                    } else {
                        setOpenMobile(false);
                    }
                }}
            >
                <SheetContent
                    data-sidebar="sidebar"
                    data-mobile="true"
                    className="w-(--sidebar-width) border-zinc-800 bg-zinc-950 p-0 text-zinc-50 [&>button]:hidden"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <div className="flex h-full w-full flex-col">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className="2lg:block group peer hidden text-zinc-50"
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            {/* This is what handles the sidebar gap on desktop */}
            <div
                data-slot="sidebar-gap"
                className={cn(
                    "w-(--sidebar-width) relative bg-transparent transition-[width] duration-200 ease-linear",
                    "group-data-[collapsible=offcanvas]:w-0",
                    "group-data-[side=right]:rotate-180",
                    variant === "floating" || variant === "inset"
                        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                )}
            />
            <div
                data-slot="sidebar-container"
                className={cn(
                    "w-(--sidebar-width) 2lg:flex fixed inset-y-0 z-10 hidden h-svh border-zinc-800 transition-[left,right,width] duration-200 ease-linear",
                    side === "left"
                        ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                        : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                    // Adjust the padding for floating and inset variants.
                    variant === "floating" || variant === "inset"
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                    className="flex h-full w-full flex-col bg-zinc-950 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-zinc-400"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";

import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "./constants";

export function SidebarWrapper({
    children,
    style,
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-wrapper"
            style={
                {
                    "--sidebar-width": SIDEBAR_WIDTH,
                    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                    ...style,
                } as React.CSSProperties
            }
            className={cn(
                "group/sidebar-wrapper has-data-[variant=inset]:bg-zinc-950 flex min-h-svh w-full",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

import { cn } from "@/lib/utils";

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
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
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

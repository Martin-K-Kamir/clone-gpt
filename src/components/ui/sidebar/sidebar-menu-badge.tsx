import { cn } from "@/lib/utils";

type SidebarMenuBadgeProps = {
    showOnHover?: boolean;
} & React.ComponentProps<"div">;

export function SidebarMenuBadge({
    className,
    showOnHover,
    ...props
}: SidebarMenuBadgeProps) {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                "pointer-events-none absolute right-2 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-zinc-400",
                "peer-hover/menu-button:text-zinc-50 peer-data-[active=true]/menu-button:text-zinc-50",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                    "2lg:opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-zinc-50",
                className,
            )}
            {...props}
        />
    );
}

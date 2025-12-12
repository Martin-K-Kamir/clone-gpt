import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type SidebarMenuSubButtonProps = {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
} & React.ComponentProps<"a">;

export function SidebarMenuSubButton({
    asChild = false,
    size = "md",
    isActive = false,
    className,
    ...props
}: SidebarMenuSubButtonProps) {
    const Comp = asChild ? Slot : "a";

    return (
        <Comp
            data-slot="sidebar-menu-sub-button"
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                "outline-hidden flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-zinc-50 ring-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 focus-visible:ring-2 active:bg-zinc-800 active:text-zinc-50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-zinc-50",
                "data-[active=true]:bg-zinc-800 data-[active=true]:text-zinc-50",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

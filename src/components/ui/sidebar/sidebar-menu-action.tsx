import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type SidebarMenuActionProps = {
    asChild?: boolean;
    showOnHover?: boolean;
} & React.ComponentProps<"button">;

export function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: SidebarMenuActionProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-menu-action"
            data-sidebar="menu-action"
            className={cn(
                "outline-hidden absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-zinc-50 ring-zinc-400 transition-transform hover:bg-zinc-800 hover:text-zinc-50 focus-visible:ring-2 peer-hover/menu-button:text-zinc-50 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "2lg:after:hidden after:absolute after:-inset-2",
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

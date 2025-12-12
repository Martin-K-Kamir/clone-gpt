import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type SidebarGroupActionProps = {
    asChild?: boolean;
} & React.ComponentProps<"button">;

export function SidebarGroupAction({
    className,
    asChild = false,
    ...props
}: SidebarGroupActionProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-group-action"
            data-sidebar="group-action"
            className={cn(
                "outline-hidden absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-zinc-50 ring-zinc-400 transition-transform hover:bg-zinc-800 hover:text-zinc-50 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "2lg:after:hidden after:absolute after:-inset-2",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

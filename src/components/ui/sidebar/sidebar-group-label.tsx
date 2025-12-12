import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type SidebarGroupLabelProps = {
    asChild?: boolean;
} & React.ComponentProps<"div">;

export function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
}: SidebarGroupLabelProps) {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="sidebar-group-label"
            data-sidebar="group-label"
            className={cn(
                "outline-hidden flex h-8 shrink-0 items-center rounded-md px-2 text-[13px] font-medium text-zinc-400 ring-zinc-400 transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

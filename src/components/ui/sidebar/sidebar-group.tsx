import { cn } from "@/lib/utils";

export function SidebarGroup({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn(
                "relative flex w-full min-w-0 flex-col overflow-auto pr-2 group-data-[collapsible=icon]:overflow-hidden",
                className,
            )}
            {...props}
        />
    );
}

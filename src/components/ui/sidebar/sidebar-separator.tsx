import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

export function SidebarSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn("w-auto bg-zinc-800", className)}
            {...props}
        />
    );
}

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

export function SidebarInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            className={cn("h-8 w-full bg-zinc-950 shadow-none", className)}
            {...props}
        />
    );
}

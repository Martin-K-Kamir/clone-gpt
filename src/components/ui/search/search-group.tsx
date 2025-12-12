import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";

export function SearchGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="search-group"
            className={cn(
                "not-last:mb-2 overflow-hidden text-zinc-50 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-400",
                className,
            )}
            {...props}
        />
    );
}

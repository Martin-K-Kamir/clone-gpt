import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

export function SelectLabel({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn("px-2 py-1.5 text-xs text-zinc-400", className)}
            {...props}
        />
    );
}

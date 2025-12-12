import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

export function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn(
                "pointer-events-none -mx-1 my-1 h-px bg-zinc-800",
                className,
            )}
            {...props}
        />
    );
}

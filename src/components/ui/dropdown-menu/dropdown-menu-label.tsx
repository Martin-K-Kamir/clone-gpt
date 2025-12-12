import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

type DropdownMenuLabelProps = {
    inset?: boolean;
} & React.ComponentProps<typeof DropdownMenuPrimitive.Label>;

export function DropdownMenuLabel({
    className,
    inset,
    ...props
}: DropdownMenuLabelProps) {
    return (
        <DropdownMenuPrimitive.Label
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn(
                "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
                className,
            )}
            {...props}
        />
    );
}

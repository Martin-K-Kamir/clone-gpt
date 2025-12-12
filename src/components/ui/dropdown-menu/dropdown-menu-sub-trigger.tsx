import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DropdownMenuSubTriggerProps = {
    inset?: boolean;
} & React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>;

export function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: DropdownMenuSubTriggerProps) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "outline-hidden relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm focus:bg-zinc-700/60 focus:text-zinc-50 data-[disabled]:pointer-events-none data-[state=open]:bg-zinc-700/60 data-[inset]:pl-8 data-[variant=destructive]:text-rose-400 data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-rose-600/15 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-400 data-[variant=destructive]:[&_svg:not([class*='text-'])]:text-red-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className,
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto size-4" />
        </DropdownMenuPrimitive.SubTrigger>
    );
}

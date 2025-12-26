import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            data-testid="select-item"
            className={cn(
                "outline-hidden *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex min-h-10 w-full cursor-pointer select-none items-center gap-2 rounded-lg py-1.5 pl-2 pr-8 text-sm focus:bg-zinc-700/60 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 sm:min-h-9 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className,
            )}
            {...props}
        >
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-4 text-zinc-100" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

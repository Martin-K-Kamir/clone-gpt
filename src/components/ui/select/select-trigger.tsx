import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

type SelectTriggerProps = {
    size?: "sm" | "default";
    isLoading?: boolean;
    classNameSkeleton?: string;
    classNameWrapper?: string;
} & React.ComponentProps<typeof SelectPrimitive.Trigger>;

export function SelectTrigger({
    className,
    children,
    isLoading,
    classNameSkeleton,
    classNameWrapper,
    disabled,
    size = "default",
    ...props
}: SelectTriggerProps) {
    const trigger = (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "shadow-xs aria-invalid:border-red-900 aria-invalid:ring-red-900/40 flex min-h-10 w-fit cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-zinc-700 bg-zinc-800/30 px-3 py-1.5 text-sm outline-none transition-[color,box-shadow] focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 data-[state=open]:bg-zinc-700/60 data-[placeholder]:text-zinc-400 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 sm:min-h-9 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-zinc-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                !isLoading && !disabled && "hover:bg-zinc-700/60",
                className,
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {!isLoading && children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="ml-auto size-4 opacity-75" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );

    if (isLoading) {
        return (
            <div className={cn("relative grid items-center", classNameWrapper)}>
                {trigger}
                <Skeleton
                    className={cn(
                        "absolute left-3 h-3.5 w-2/4 bg-zinc-700",
                        classNameSkeleton,
                    )}
                />
            </div>
        );
    }

    return trigger;
}

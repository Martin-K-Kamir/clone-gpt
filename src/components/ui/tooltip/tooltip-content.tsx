import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

export function TooltipContent({
    className,
    children,
    sideOffset = 6,
    showArrow = false,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
}) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    "animate-in pointer-coarse:opacity-0 fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin) z-50 w-fit text-balance rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50",
                    className,
                )}
                {...props}
            >
                {children}
                {showArrow && (
                    <TooltipPrimitive.Arrow className="fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-zinc-900" />
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { TooltipProvider } from "./tooltip-provider";

export function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

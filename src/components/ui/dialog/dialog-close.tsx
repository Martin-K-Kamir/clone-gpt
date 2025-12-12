import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export function DialogClose({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return (
        <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
                "outline-hidden cursor-pointer rounded-full p-1 text-zinc-100 opacity-70 ring-blue-500 hover:bg-zinc-700/60 hover:opacity-100 focus-visible:bg-zinc-700/60 focus-visible:opacity-100 focus-visible:ring-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className,
            )}
            {...props}
        >
            <IconX />
            <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
    );
}

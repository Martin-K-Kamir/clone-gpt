import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

export function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn("text-lg font-semibold leading-none", className)}
            {...props}
        />
    );
}

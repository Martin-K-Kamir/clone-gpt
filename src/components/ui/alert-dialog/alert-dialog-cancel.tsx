import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function AlertDialogCancel({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
    return (
        <AlertDialogPrimitive.Cancel
            className={cn(
                buttonVariants({ variant: "ghost" }),
                "hover:bg-zinc-700 focus-visible:bg-zinc-700",
                className,
            )}
            {...props}
        />
    );
}

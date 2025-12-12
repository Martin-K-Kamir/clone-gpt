import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function AlertDialogAction({
    variant = "default",
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & {
    variant?: "default" | "destructive";
}) {
    return (
        <AlertDialogPrimitive.Action
            className={cn(buttonVariants({ variant }), className)}
            {...props}
        />
    );
}

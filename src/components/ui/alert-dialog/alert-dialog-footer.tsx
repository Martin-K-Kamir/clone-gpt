import { cn } from "@/lib/utils";

export function AlertDialogFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-dialog-footer"
            className={cn(
                "mt-4 flex flex-col-reverse gap-2 sm:mt-0 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    );
}

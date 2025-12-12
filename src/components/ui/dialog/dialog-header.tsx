import { cn } from "@/lib/utils";

export function DialogHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-header"
            className={cn("flex flex-col gap-2 text-left", className)}
            {...props}
        />
    );
}

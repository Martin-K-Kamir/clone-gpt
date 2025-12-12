import { cn } from "@/lib/utils";

export function TableHeader({
    className,
    ...props
}: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn("", className)}
            {...props}
        />
    );
}

import { cn } from "@/lib/utils";

export function TableFooter({
    className,
    ...props
}: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn("bg-zinc-800/50 font-medium", className)}
            {...props}
        />
    );
}

import { cn } from "@/lib/utils";

export function TableCaption({
    className,
    ...props
}: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("mt-4 text-sm text-zinc-400", className)}
            {...props}
        />
    );
}

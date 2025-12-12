import { cn } from "@/lib/utils";

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "rounded-xl [clip-path:xywh(0_0_100%_100%_round_0.5rem)]",
                className,
            )}
            {...props}
        />
    );
}

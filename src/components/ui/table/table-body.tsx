import { cn } from "@/lib/utils";

export function TableBody({
    className,
    ...props
}: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:nth-child(even)]:bg-zinc-700/40", className)}
            {...props}
        />
    );
}

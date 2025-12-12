import { cn } from "@/lib/utils";

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "h-10 whitespace-nowrap border-b border-zinc-700 px-2.5 text-left align-middle font-medium text-zinc-50 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                className,
            )}
            {...props}
        />
    );
}

import { cn } from "@/lib/utils";

export function SearchEmpty({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="search-empty"
            role="option"
            aria-disabled="true"
            aria-selected="false"
            className={cn(
                "text-pretty py-6 text-center text-sm font-medium text-zinc-400",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

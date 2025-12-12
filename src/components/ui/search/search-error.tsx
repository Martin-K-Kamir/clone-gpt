import { cn } from "@/lib/utils";

export function SearchError({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="search-error"
            role="option"
            aria-disabled="true"
            aria-selected="false"
            className={cn(
                "flex flex-col items-center gap-2 text-pretty py-6 text-center text-sm font-medium text-rose-400",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

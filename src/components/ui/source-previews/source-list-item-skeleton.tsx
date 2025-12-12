import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

export function SourceListItemSkeleton({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("my-2 flex flex-col p-3", className)} {...props}>
            <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full bg-zinc-700" />
                <Skeleton className="h-4 w-24 rounded-full bg-zinc-700" />
            </div>
            <Skeleton className="mt-2.5 h-5 w-full bg-zinc-700" />
            <Skeleton className="mt-2 h-5 w-full bg-zinc-700" />
            <Skeleton className="mt-2 h-5 w-1/2 bg-zinc-700" />
        </div>
    );
}

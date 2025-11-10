import { IconDotsVertical } from "@tabler/icons-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UserSidebarItemSkeleton({
    className,
    ...props
}: Omit<React.ComponentProps<"div">, "children">) {
    return (
        <div
            className={cn("flex min-h-12 items-center gap-3 px-2.5", className)}
            {...props}
        >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="w-full space-y-1">
                <Skeleton className="h-2.5 w-2/4" />
                <Skeleton className="h-2.5 w-5/6" />
            </div>
            <IconDotsVertical className="ml-auto size-4 shrink-0 text-zinc-400" />
        </div>
    );
}

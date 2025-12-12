import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

type SidebarMenuSkeletonProps = {
    showIcon?: boolean;
} & React.ComponentProps<"div">;

export function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: SidebarMenuSkeletonProps) {
    const width = useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2",
                className,
            )}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="max-w-(--skeleton-width) h-4 flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        "--skeleton-width": width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
}

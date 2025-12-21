import { SidebarGroup } from "@/components/ui/sidebar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { cn, generateSizePercentage } from "@/lib/utils";

type ChatSidebarHistorySkeletonProps = {
    length?: number;
    classNameItem?: string;
    classNameSkeleton?: string;
} & Omit<React.ComponentProps<typeof SidebarGroup>, "children">;

export function ChatSidebarHistorySkeleton({
    length = 16,
    className,
    classNameItem,
    classNameSkeleton,
    ...props
}: ChatSidebarHistorySkeletonProps) {
    return (
        <SidebarGroup className={className} {...props}>
            <ChatSidebarItemsSkeleton
                length={length}
                classNameItem={classNameItem}
                classNameSkeleton={classNameSkeleton}
            />
        </SidebarGroup>
    );
}

type ChatSidebarItemsSkeletonProps = {
    length?: number;
    classNameItem?: string;
    classNameSkeleton?: string;
} & Omit<React.ComponentProps<typeof SidebarMenu>, "children">;

export function ChatSidebarItemsSkeleton({
    length = 16,
    className,
    classNameItem,
    classNameSkeleton,
    ...props
}: ChatSidebarItemsSkeletonProps) {
    return (
        <SidebarMenu
            className={cn("gap-0", className)}
            {...props}
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading chat list"
        >
            {Array.from({ length }).map((_, index) => (
                <SidebarMenuItem
                    aria-hidden
                    key={index}
                    className={classNameItem}
                >
                    <SidebarMenuButton
                        aria-hidden
                        className="cursor-default"
                        disabled
                    >
                        <Skeleton
                            className={cn("h-6 w-full", classNameSkeleton)}
                            style={{
                                width: generateSizePercentage(index),
                            }}
                        />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

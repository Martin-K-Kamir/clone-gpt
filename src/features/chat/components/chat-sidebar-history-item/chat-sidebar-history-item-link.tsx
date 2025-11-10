import Link from "next/link";

import { sidebarMenuButtonVariants } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

type ChatSidebarHistoryItemLinkProps = {
    isActive: boolean;
} & React.ComponentProps<typeof Link>;

export function ChatSidebarHistoryItemLink({
    isActive,
    className,
    children,
    ...props
}: ChatSidebarHistoryItemLinkProps) {
    return (
        <Link
            aria-current={isActive ? "page" : undefined}
            data-active={isActive}
            className={cn(
                "group/menu-button pointer-coarse:pr-0 justify-between pr-1 has-[[data-state=open]]:bg-zinc-800/70",
                sidebarMenuButtonVariants({ size: "default" }),
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}

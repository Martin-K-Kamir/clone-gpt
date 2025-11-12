import { IconDots, IconShare2 } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

type ChatViewHeaderSkeletonProps = {
    showActions?: boolean;
} & Omit<React.ComponentProps<"header">, "children">;

export function ChatViewHeaderSkeleton({
    showActions = true,
    className,
    ...props
}: ChatViewHeaderSkeletonProps) {
    return (
        <header
            className={cn(
                "h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b border-zinc-800 transition-[width,height] ease-linear",
                className,
            )}
            {...props}
        >
            <div className="flex w-full items-center gap-0.5 px-3 lg:gap-2 lg:px-5">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-1 data-[orientation=vertical]:h-4 sm:mx-2"
                />
                <h1 className="ml-2.5 text-base font-medium">
                    <Link href="/">CloneGPT</Link>
                </h1>

                {showActions && (
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <IconShare2 />
                            Share
                        </Button>
                        <Button variant="ghost" size="sm" className="size-8">
                            <IconDots />
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}

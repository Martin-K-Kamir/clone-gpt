import { IconDots, IconShare2 } from "@tabler/icons-react";

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
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-5">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">CloneGPT</h1>

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

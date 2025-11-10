import { DelayedRender } from "@/components/ui/delayed-render";
import { Loader } from "@/components/ui/loader";
import { TextShimmer } from "@/components/ui/text-shimmer";

import { ChatComposerSkeleton } from "@/features/chat/components/chat-composer";

import { cn } from "@/lib/utils";

type ChatViewBodySkeletonProps = {
    length?: number;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatViewBodySkeleton({
    className,
    ...props
}: ChatViewBodySkeletonProps) {
    return (
        <div
            className={cn(
                "flex size-full flex-col overflow-hidden pt-12",
                className,
            )}
            {...props}
        >
            <div className="grid flex-1 place-items-center">
                <div className="flex items-center gap-2.5">
                    <DelayedRender delay={500}>
                        <Loader />
                        <TextShimmer>Loading chat...</TextShimmer>
                    </DelayedRender>
                </div>
            </div>
            <ChatComposerSkeleton />
        </div>
    );
}

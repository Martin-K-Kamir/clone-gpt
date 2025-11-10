import { PromptComposer } from "@/components/ui/prompt-composer";

import { cn } from "@/lib/utils";

export function ChatComposerSkeleton({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "shadow-zinc-925 z-10 px-4 shadow-[0_-8px_40px_20px_rgba(0,0,0,0.1)] lg:pr-[calc(var(--scrollbar-size)+1rem)]",
                className,
            )}
            {...props}
        >
            <div className="mx-auto w-full max-w-3xl pb-12">
                <div className="relative rounded-3xl">
                    <PromptComposer className={cn("relative z-10")} disabled />
                    <div className="bg-zinc-925 absolute top-0 h-full w-full translate-y-1/2" />
                </div>
            </div>
        </div>
    );
}

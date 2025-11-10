import { sidebarMenuButtonVariants } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

export function ChatSidebarHistoryItemInput({
    className,
    ...props
}: React.ComponentProps<"input">) {
    return (
        <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            name="chat-title"
            className={cn(
                sidebarMenuButtonVariants({ size: "default" }),
                "!bg-zinc-600/70 focus-visible:ring-0",
                className,
            )}
            {...props}
        />
    );
}

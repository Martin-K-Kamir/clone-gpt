import { useChatContext } from "@/features/chat/providers/chat-provider";

import { cn } from "@/lib/utils";

export function ChatComposerPublicNotice({
    className,
    ...props
}: Omit<React.ComponentProps<"p">, "children">) {
    const { isOwner, isPublic } = useChatContext();

    if (isOwner || !isPublic) {
        return null;
    }

    return (
        <p
            className={cn("text-balance text-sm text-zinc-400", className)}
            {...props}
        >
            Public chat. Send a message to copy and continue.
        </p>
    );
}

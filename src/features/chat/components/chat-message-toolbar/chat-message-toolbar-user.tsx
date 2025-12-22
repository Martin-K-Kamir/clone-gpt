import { ChatStatus } from "ai";

import { ChatMessageActionsUser } from "@/features/chat/components/chat-message-actions";
import type { UIUserChatMessage } from "@/features/chat/lib/types";
import {
    useChatContext,
    useChatMessagesRateLimitContext,
} from "@/features/chat/providers";

import { cn } from "@/lib/utils";

type ChatMessageToolbarUserProps = {
    canShowActions: boolean;
    status: ChatStatus;
    content: string;
    parts: UIUserChatMessage["parts"];
    onUpdate: () => void;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageToolbarUser({
    canShowActions,
    status,
    content,
    parts,
    className,
    onUpdate,
}: ChatMessageToolbarUserProps) {
    const { isOwner } = useChatContext();
    const { rateLimit } = useChatMessagesRateLimitContext();

    const canShowUpdate =
        parts.every(part => (part as { kind?: unknown }).kind === undefined) &&
        !rateLimit?.isOverLimit &&
        isOwner;
    const actionsDisabled = status === "streaming" || status === "submitted";

    if (!canShowActions) {
        return null;
    }

    return (
        <ChatMessageActionsUser
            className={cn(
                "pointer-coarse:opacity-100 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100",
                className,
            )}
            content={content}
            disabled={actionsDisabled}
            showUpdate={canShowUpdate}
            onUpdate={onUpdate}
        />
    );
}

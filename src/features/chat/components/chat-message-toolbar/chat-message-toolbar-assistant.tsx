"use client";

import { useRef } from "react";

import { ChatMessageActionsAssistant } from "@/features/chat/components/chat-message-actions";
import { ChatSourceDialog } from "@/features/chat/components/chat-source-dialog";
import type {
    AssistantChatMessageMetadata,
    DBChatId,
    DBChatMessageId,
    UIAssistantChatMessage,
} from "@/features/chat/lib/types";
import {
    useChatContext,
    useChatMessagesRateLimitContext,
} from "@/features/chat/providers";

import { cn } from "@/lib/utils";

type ChatMessageToolbarAssistantProps = {
    canShowActions: boolean;
    chatId: DBChatId;
    messageId: DBChatMessageId;
    content: string;
    parts: UIAssistantChatMessage["parts"];
    metadata?: AssistantChatMessageMetadata;
    disabled?: boolean;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageToolbarAssistant({
    canShowActions,
    chatId,
    messageId,
    content,
    parts,
    metadata,
    disabled,
    className,
    ...props
}: ChatMessageToolbarAssistantProps) {
    const copyButtonRef = useRef<HTMLButtonElement>(null);
    const regenerateButtonRef = useRef<HTMLButtonElement>(null);
    const upVoteButtonRef = useRef<HTMLButtonElement>(null);
    const downVoteButtonRef = useRef<HTMLButtonElement>(null);
    const resourceTriggerRef = useRef<HTMLButtonElement>(null);
    const { rateLimit, isPending: isRateLimitPending } =
        useChatMessagesRateLimitContext();
    const { isOwner } = useChatContext();

    const canShowRegenerate = !rateLimit?.isOverLimit && isOwner;
    const canShowUpvote = isOwner;
    const canShowDownvote = isOwner;

    const shouldAnimate = canShowActions && !isRateLimitPending;

    return (
        <div
            className={cn(
                "flex items-center",
                shouldAnimate && "toolbar-animate opacity-100",
                !shouldAnimate && "opacity-0 [animation-play-state:paused]",
                className,
            )}
            {...props}
        >
            <ChatMessageActionsAssistant
                chatId={chatId}
                messageId={messageId}
                content={content}
                metadata={metadata}
                disabled={disabled}
                copyButtonRef={copyButtonRef}
                regenerateButtonRef={regenerateButtonRef}
                upvoteButtonRef={upVoteButtonRef}
                downvoteButtonRef={downVoteButtonRef}
                showRegenerate={canShowRegenerate}
                showUpvote={canShowUpvote}
                showDownvote={canShowDownvote}
            />

            <ChatSourceDialog
                parts={parts}
                disabled={disabled}
                triggerRef={resourceTriggerRef}
            />
        </div>
    );
}

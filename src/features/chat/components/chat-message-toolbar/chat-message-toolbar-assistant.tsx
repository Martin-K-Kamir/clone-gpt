"use client";

import { animate, stagger } from "framer-motion";
import { useEffect, useRef } from "react";

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

    useEffect(() => {
        const buttons = [
            copyButtonRef.current,
            regenerateButtonRef.current,
            upVoteButtonRef.current,
            downVoteButtonRef.current,
            resourceTriggerRef.current,
        ];

        buttons.forEach(button => {
            if (button) {
                button.style.opacity = "0";
                button.style.transform = "scale(0.01)";
                button.style.transition = "none";
            }
        });
    }, []);

    useEffect(() => {
        if (!canShowActions || isRateLimitPending) return;

        const timeoutId = setTimeout(() => {
            const buttons = [
                copyButtonRef.current,
                regenerateButtonRef.current,
                upVoteButtonRef.current,
                downVoteButtonRef.current,
                resourceTriggerRef.current,
            ];

            animate(
                buttons.filter(Boolean),
                {
                    opacity: 1,
                    scale: 1,
                },
                {
                    delay: stagger(0.1, { startDelay: 0.1 }),
                    duration: 0.15,
                    ease: "easeOut",
                },
            );
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [canShowActions, isRateLimitPending]);

    return (
        <div className={cn("flex items-center", className)} {...props}>
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

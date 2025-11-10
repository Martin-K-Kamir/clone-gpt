"use client";

import type {
    AssistantChatMessageMetadata,
    DBChatId,
    DBChatMessageId,
} from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

import { ChatMessageCopyButton } from "./chat-message-copy-button";
import { ChatMessageRegenerateButton } from "./chat-message-regenerate-button";
import {
    ChatMessageDownvoteButton,
    ChatMessageUpvoteButton,
    ChatMessageVotes,
} from "./chat-message-votes";

type ChatMessageActionsAssistantProps = {
    chatId: DBChatId;
    messageId: DBChatMessageId;
    content: string;
    metadata?: AssistantChatMessageMetadata;
    disabled?: boolean;
    copyButtonRef?: React.RefObject<HTMLButtonElement | null>;
    regenerateButtonRef?: React.RefObject<HTMLButtonElement | null>;
    upvoteButtonRef?: React.RefObject<HTMLButtonElement | null>;
    downvoteButtonRef?: React.RefObject<HTMLButtonElement | null>;
    showCopy?: boolean;
    showRegenerate?: boolean;
    showUpvote?: boolean;
    showDownvote?: boolean;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageActionsAssistant({
    chatId,
    messageId,
    content,
    metadata,
    className,
    disabled,
    copyButtonRef,
    regenerateButtonRef,
    upvoteButtonRef,
    downvoteButtonRef,
    showCopy = true,
    showRegenerate = true,
    showUpvote = true,
    showDownvote = true,
    ...props
}: ChatMessageActionsAssistantProps) {
    return (
        <div className={cn("flex items-center", className)} {...props}>
            {showCopy && (
                <ChatMessageCopyButton
                    ref={copyButtonRef}
                    content={content}
                    disabled={disabled}
                />
            )}

            {showRegenerate && (
                <ChatMessageRegenerateButton
                    ref={regenerateButtonRef}
                    messageId={messageId}
                    disabled={disabled}
                />
            )}

            <ChatMessageVotes
                messageId={messageId}
                chatId={chatId}
                isUpvoted={metadata?.isUpvoted || false}
                isDownvoted={metadata?.isDownvoted || false}
                disabled={disabled}
            >
                {showUpvote && (
                    <ChatMessageUpvoteButton
                        ref={upvoteButtonRef}
                        disabled={disabled}
                    />
                )}
                {showDownvote && (
                    <ChatMessageDownvoteButton
                        ref={downvoteButtonRef}
                        disabled={disabled}
                    />
                )}
            </ChatMessageVotes>
        </div>
    );
}

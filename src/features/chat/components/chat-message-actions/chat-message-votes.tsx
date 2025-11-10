"use client";

import {
    IconThumbDown,
    IconThumbDownFilled,
    IconThumbUp,
    IconThumbUpFilled,
} from "@tabler/icons-react";
import {
    createContext,
    startTransition,
    useContext,
    useOptimistic,
} from "react";
import { toast } from "sonner";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";
import {
    downvoteChatMessage,
    upvoteChatMessage,
} from "@/features/chat/services/actions";

import { ChatMessageButton } from "./chat-message-button";

export function ChatMessageUpvoteButton({
    disabled,
    onClick,
    ...props
}: Omit<React.ComponentProps<typeof ChatMessageButton>, "children">) {
    const { handleUpvote, isUpvoted } = useChatMessageVotes();

    return (
        <ChatMessageButton
            tooltip={isUpvoted ? "Remove upvote" : "Upvote"}
            disabled={disabled}
            onClick={e => {
                if (disabled) return;
                onClick?.(e);
                handleUpvote();
            }}
            {...props}
        >
            <span className="sr-only">{isUpvoted ? "Upvoted" : "Upvote"}</span>
            {isUpvoted ? <IconThumbUpFilled /> : <IconThumbUp />}
        </ChatMessageButton>
    );
}

export function ChatMessageDownvoteButton({
    disabled,
    onClick,
    ...props
}: Omit<React.ComponentProps<typeof ChatMessageButton>, "children">) {
    const { handleDownvote, isDownvoted } = useChatMessageVotes();

    return (
        <ChatMessageButton
            tooltip={isDownvoted ? "Remove downvote" : "Downvote"}
            disabled={disabled}
            onClick={e => {
                if (disabled) return;
                onClick?.(e);
                handleDownvote();
            }}
            {...props}
        >
            <span className="sr-only">
                {isDownvoted ? "Downvoted" : "Downvote"}
            </span>
            {isDownvoted ? <IconThumbDownFilled /> : <IconThumbDown />}
        </ChatMessageButton>
    );
}

type ChatMessageVotesContextValue = {
    isUpvoted: boolean;
    isDownvoted: boolean;
    handleUpvote: () => void;
    handleDownvote: () => void;
};

export const ChatMessageVotesContext =
    createContext<ChatMessageVotesContextValue | null>(null);

export function useChatMessageVotes() {
    const context = useContext(ChatMessageVotesContext);
    if (!context) {
        throw new Error(
            "useChatMessageVotes must be used within a ChatMessageVotesAction",
        );
    }
    return context;
}

type ChatMessageVotesProps = {
    messageId: DBChatMessageId;
    chatId: DBChatId;
    isUpvoted: boolean;
    isDownvoted: boolean;
    disabled?: boolean;
    children: React.ReactNode;
};

export function ChatMessageVotes({
    messageId,
    chatId,
    isUpvoted,
    isDownvoted,
    disabled,
    children,
}: ChatMessageVotesProps) {
    const [optimisticIsUpvoted, setOptimisticIsUpvoted] =
        useOptimistic(isUpvoted);
    const [optimisticIsDownvoted, setOptimisticIsDownvoted] =
        useOptimistic(isDownvoted);

    async function handleUpvote() {
        if (disabled) return;

        startTransition(async () => {
            setOptimisticIsUpvoted(!isUpvoted);
            setOptimisticIsDownvoted(false);

            const response = await upvoteChatMessage({
                messageId,
                chatId,
                upvote: !isUpvoted,
            });

            if (!response.success) {
                toast.error(response.message);
            }
        });
    }

    async function handleDownvote() {
        if (disabled) return;

        startTransition(async () => {
            setOptimisticIsDownvoted(!isDownvoted);
            setOptimisticIsUpvoted(false);

            const response = await downvoteChatMessage({
                messageId,
                chatId,
                downvote: !isDownvoted,
            });

            if (!response.success) {
                toast.error(response.message);
            }
        });
    }

    return (
        <ChatMessageVotesContext
            value={{
                isUpvoted: optimisticIsUpvoted,
                isDownvoted: optimisticIsDownvoted,
                handleUpvote,
                handleDownvote,
            }}
        >
            {children}
        </ChatMessageVotesContext>
    );
}

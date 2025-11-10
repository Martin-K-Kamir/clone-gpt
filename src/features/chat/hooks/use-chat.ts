"use client";

import { useChat as useAiChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useChatFiles } from "@/features/chat/hooks";
import { CHAT_ROLE, CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { chatTextSchema } from "@/features/chat/lib/schemas";
import type {
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";
import {
    createUserMessage,
    fetchWithErrorHandlers,
    findMessageIndex,
    findNextAssistantMessage,
    handleNewChatFinish,
    handleUpdateChatFinish,
    updateMessageParts,
} from "@/features/chat/lib/utils";
import {
    useChatCacheSyncContext,
    useChatSidebarContext,
} from "@/features/chat/providers";

import type {
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";
import { getUserChatPreferences } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tags";
import { getParseErrors } from "@/lib/utils";

import { useUuid } from "@/hooks";

type UseChatProps = {
    userId: DBUserId;
    isNewChat?: boolean;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    initialChatId?: DBChatId;
    initialMessages?: UIChatMessage[];
    initialUserChatPreferences: DBUserChatPreferences | null;
    onFinish?: () => void;
    onNewChatFinished?: () => void;
    onDuplicatedChatFinished?: () => void;
    onUpdatedChatFinished?: () => void;
};

export function useChat({
    isNewChat,
    initialChatId,
    initialMessages,
    initialUserChatPreferences,
    isOwner,
    visibility,
    userId,
    onFinish,
    onNewChatFinished,
    onDuplicatedChatFinished,
    onUpdatedChatFinished,
}: UseChatProps) {
    const canDuplicateChatRef = useRef(
        !isOwner && visibility === CHAT_VISIBILITY.PUBLIC,
    );
    const isNewChatRef = useRef(isNewChat);
    const messagesStringified = useRef(JSON.stringify(initialMessages));
    const chatCacheSync = useChatCacheSyncContext();
    const chatSidebarContext = useChatSidebarContext();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const getNewChatId = useUuid<DBChatId>();
    const { data: userChatPreferences } = useQuery({
        queryKey: [tag.userChatPreferences(userId)],
        queryFn: () => getUserChatPreferences(),
        initialData: initialUserChatPreferences,
    });

    const {
        id,
        messages,
        status,
        error,
        regenerate,
        stop,
        sendMessage,
        setMessages,
    } = useAiChat<UIChatMessage>({
        id: initialChatId,
        messages: initialMessages,
        generateId: () => crypto.randomUUID(),
        transport: new DefaultChatTransport({
            api: "/api/chat",
            fetch: fetchWithErrorHandlers,
            prepareSendMessagesRequest: ({
                messages,
                id,
                body,
                messageId,
                trigger,
            }) => ({
                body: {
                    body,
                    messageId,
                    trigger,
                    userChatPreferences,
                    chatId: id,
                    message: messages.at(-1),
                    newChatId: canDuplicateChatRef.current
                        ? getNewChatId()
                        : undefined,
                },
            }),
        }),
        onFinish: async ({ isError }) => {
            if (isError) {
                return;
            }

            onFinish?.();
            setIsSubmitted(false);

            if (canDuplicateChatRef.current) {
                handleNewChatFinish({
                    chatCacheSync,
                    chatId: getNewChatId(),
                });
                onDuplicatedChatFinished?.();
                return;
            }

            if (!isNewChatRef.current) {
                isNewChatRef.current = false;
                handleUpdateChatFinish({
                    chatCacheSync,
                    chatSidebarContext,
                    chatId: id as DBChatId,
                });

                onUpdatedChatFinished?.();
                return;
            }

            handleNewChatFinish({
                chatCacheSync,
                chatId: id as DBChatId,
            });
            onNewChatFinished?.();
        },
    });

    const {
        selectedFiles,
        uploadedFiles,
        isUploadingFiles,
        handleFileSelect,
        handleFileRemove,
        handleClearFiles,
    } = useChatFiles({ isSubmitted, chatId: id as DBChatId });

    // Sync messages when initialMessages changes
    useEffect(() => {
        if (
            !initialMessages ||
            messagesStringified.current === JSON.stringify(initialMessages)
        ) {
            return;
        }

        messagesStringified.current = JSON.stringify(initialMessages);
        setMessages(initialMessages);
    }, [initialMessages, setMessages]);

    const handleSendMessage = useCallback(
        (text: string) => {
            const result = chatTextSchema.safeParse(text);

            if (!result.success) {
                const errorMessages = getParseErrors(result);

                toast.error(errorMessages.join("\n"), {
                    duration: 6_000,
                });
                return;
            }

            setIsSubmitted(true);

            const userMessage = createUserMessage(
                text,
                uploadedFiles,
                selectedFiles,
            );

            sendMessage(userMessage);
            handleClearFiles();
        },
        [
            uploadedFiles,
            selectedFiles,
            sendMessage,
            handleClearFiles,
            setIsSubmitted,
        ],
    );

    const handleAssistantRegenerate = useCallback(
        ({ messageId }: { messageId: DBChatMessageId }) => {
            regenerate({
                messageId,
                body: {
                    regeneratedMessageRole: CHAT_ROLE.ASSISTANT,
                },
            });
        },
        [regenerate],
    );

    const handleUserRegenerate = useCallback(
        ({
            messageId,
            newMessage,
        }: {
            messageId: DBChatMessageId;
            newMessage: string;
        }) => {
            const messageIndex = findMessageIndex(messages, messageId);
            const nextAssistantMessage = findNextAssistantMessage(
                messages,
                messageIndex,
            );

            if (!nextAssistantMessage) {
                return;
            }

            setMessages(prevMessages =>
                updateMessageParts(prevMessages, messageId, newMessage),
            );

            regenerate({
                messageId: nextAssistantMessage.id,
                body: {
                    regeneratedMessageRole: CHAT_ROLE.USER,
                },
            });
        },
        [messages, setMessages, regenerate],
    );

    return {
        status,
        messages,
        error,
        selectedFiles,
        uploadedFiles,
        isUploadingFiles,
        chatId: id as DBChatId,
        isStreaming: status === "streaming",
        isSubmitted: status === "submitted",
        isReady: status === "ready",
        isError: status === "error",
        handleSendMessage,
        handleAssistantRegenerate,
        handleUserRegenerate,
        handleFileSelect,
        handleFileRemove,
        handleStop: stop,
    };
}

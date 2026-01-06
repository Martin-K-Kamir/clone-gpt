"use client";

import { ChatStatus } from "ai";
import { createContext, useContext, useMemo, useState } from "react";

import { useChat } from "@/features/chat/hooks";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type {
    ChatUploadedFile,
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";

import {
    useUserFilesRateLimit,
    useUserMessagesRateLimit,
} from "@/features/user/hooks";
import type {
    DBUserChatPreferences,
    DBUserId,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";

type ChatContext = {
    chatId: DBChatId;
    isOwner?: boolean;
    isPrivate?: boolean;
    isPublic?: boolean;
    isNewChat?: boolean;
    visibility?: DBChatVisibility;
    setIsOwner: (isOwner: boolean) => void;
    setVisibility: (visibility: DBChatVisibility) => void;
};

type ChatMessagesRateLimitContext = {
    rateLimit: UserMessagesRateLimitResult | undefined;
    isLoading: boolean;
    isPending: boolean;
    error: Error | null;
};

type ChatFilesRateLimitContext = {
    rateLimit: UserFilesRateLimitResult | undefined;
    isLoading: boolean;
    isPending: boolean;
    error: Error | null;
};

type ChatMessagesContext = {
    messages: UIChatMessage[];
};

type ChatFilesContext = {
    selectedFiles: File[];
    uploadedFiles: ChatUploadedFile[];
    isUploadingFiles: boolean;
    handleFileSelect: (files: File[]) => void;
    handleFileRemove: (file: File) => void;
};

type ChatStatusContext = {
    status: ChatStatus;
    error: Error | undefined;
    isStreaming: boolean;
    isSubmitted: boolean;
    isReady: boolean;
    isError: boolean;
};

type ChatHandlersContext = {
    handleSendMessage: (text: string) => void;
    handleStop: () => void;
    handleAssistantRegenerate: ({
        messageId,
    }: {
        messageId: DBChatMessageId;
    }) => void;
    handleUserRegenerate: ({
        messageId,
        newMessage,
    }: {
        messageId: DBChatMessageId;
        newMessage: string;
    }) => void;
};

export const ChatContext = createContext<ChatContext | null>(null);
export const ChatMessagesRateLimitContext =
    createContext<ChatMessagesRateLimitContext | null>(null);
export const ChatFilesRateLimitContext =
    createContext<ChatFilesRateLimitContext | null>(null);
export const ChatMessagesContext = createContext<ChatMessagesContext | null>(
    null,
);
export const ChatFilesContext = createContext<ChatFilesContext | null>(null);
export const ChatStatusContext = createContext<ChatStatusContext | null>(null);
export const ChatHandlersContext = createContext<ChatHandlersContext | null>(
    null,
);

type ChatProviderProps = {
    userId: DBUserId;
    isNewChat?: boolean;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    chatId: DBChatId;
    messages: UIChatMessage[];
    userChatPreferences: DBUserChatPreferences | null;
    children: React.ReactNode;
};

export function ChatProvider({
    children,
    userId,
    isNewChat,
    isOwner: initialIsOwner,
    visibility: initialVisibility,
    chatId: initialChatId,
    messages: initialMessages,
    userChatPreferences: initialUserChatPreferences,
}: ChatProviderProps) {
    const [isOwner, setIsOwner] = useState(initialIsOwner);
    const [visibility, setVisibility] = useState(initialVisibility);
    const {
        chatId,
        messages,
        status,
        error,
        selectedFiles,
        uploadedFiles,
        isUploadingFiles,
        isStreaming,
        isSubmitted,
        isReady,
        isError,
        handleSendMessage,
        handleStop,
        handleAssistantRegenerate,
        handleUserRegenerate,
        handleFileSelect,
        handleFileRemove,
    } = useChat({
        userId,
        isNewChat,
        isOwner,
        visibility,
        initialChatId,
        initialMessages,
        initialUserChatPreferences,
        onFinish: () => {
            refetchMessagesRateLimit();
            refetchFilesRateLimit();
        },
        onDuplicatedChatFinished: () => {
            setIsOwner(true);
            setVisibility(CHAT_VISIBILITY.PRIVATE);
        },
    });

    const {
        data: messagesRateLimit,
        error: messagesRateLimitError,
        isLoading: isMessagesRateLimitLoading,
        isPending: isMessagesRateLimitPending,
        refetch: refetchMessagesRateLimit,
    } = useUserMessagesRateLimit({
        userId,
        errorToSync: error,
    });

    const {
        data: filesRateLimit,
        error: filesRateLimitError,
        isLoading: isFilesRateLimitLoading,
        isPending: isFilesRateLimitPending,
        refetch: refetchFilesRateLimit,
    } = useUserFilesRateLimit({
        userId,
        errorToSync: error,
    });

    const chatContextValue = useMemo(() => {
        return {
            chatId,
            isNewChat,
            visibility,
            isOwner,
            isPrivate: visibility
                ? visibility === CHAT_VISIBILITY.PRIVATE
                : undefined,
            isPublic: visibility
                ? visibility === CHAT_VISIBILITY.PUBLIC
                : undefined,
            setIsOwner,
            setVisibility,
        };
    }, [chatId, isNewChat, isOwner, visibility]);
    const chatMessagesContextValue = useMemo(() => ({ messages }), [messages]);
    const chatFilesContextValue = useMemo(
        () => ({
            selectedFiles,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect,
            handleFileRemove,
        }),
        [
            selectedFiles,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect,
            handleFileRemove,
        ],
    );
    const chatStatusContextValue = useMemo(
        () => ({ status, error, isStreaming, isSubmitted, isReady, isError }),
        [status, error, isStreaming, isSubmitted, isReady, isError],
    );
    const chatHandlersContextValue = useMemo(
        () => ({
            handleSendMessage,
            handleStop,
            handleAssistantRegenerate,
            handleUserRegenerate,
        }),
        [
            handleSendMessage,
            handleStop,
            handleAssistantRegenerate,
            handleUserRegenerate,
        ],
    );
    const chatMessagesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: messagesRateLimit,
            isLoading: isMessagesRateLimitLoading,
            isPending: isMessagesRateLimitPending,
            error: messagesRateLimitError,
        }),
        [
            messagesRateLimit,
            isMessagesRateLimitLoading,
            isMessagesRateLimitPending,
            messagesRateLimitError,
        ],
    );
    const chatFilesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: filesRateLimit,
            isLoading: isFilesRateLimitLoading,
            isPending: isFilesRateLimitPending,
            error: filesRateLimitError,
        }),
        [
            filesRateLimit,
            isFilesRateLimitLoading,
            isFilesRateLimitPending,
            filesRateLimitError,
        ],
    );

    return (
        <ChatContext value={chatContextValue}>
            <ChatMessagesContext value={chatMessagesContextValue}>
                <ChatFilesContext value={chatFilesContextValue}>
                    <ChatStatusContext value={chatStatusContextValue}>
                        <ChatHandlersContext value={chatHandlersContextValue}>
                            <ChatMessagesRateLimitContext
                                value={chatMessagesRateLimitContextValue}
                            >
                                <ChatFilesRateLimitContext
                                    value={chatFilesRateLimitContextValue}
                                >
                                    {children}
                                </ChatFilesRateLimitContext>
                            </ChatMessagesRateLimitContext>
                        </ChatHandlersContext>
                    </ChatStatusContext>
                </ChatFilesContext>
            </ChatMessagesContext>
        </ChatContext>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider.");
    }
    return context;
}

export function useChatMessagesContext() {
    const context = useContext(ChatMessagesContext);
    if (!context) {
        throw new Error(
            "useChatMessagesContext must be used within a ChatProvider.",
        );
    }
    return context;
}

export function useChatFilesContext() {
    const context = useContext(ChatFilesContext);
    if (!context) {
        throw new Error(
            "useChatFilesContext must be used within a ChatProvider.",
        );
    }
    return context;
}

export function useChatStatusContext() {
    const context = useContext(ChatStatusContext);
    if (!context) {
        throw new Error(
            "useChatStatusContext must be used within a ChatProvider.",
        );
    }
    return context;
}

export function useChatHandlersContext() {
    const context = useContext(ChatHandlersContext);
    if (!context) {
        throw new Error(
            "useChatHandlersContext must be used within a ChatProvider.",
        );
    }
    return context;
}

export function useChatMessagesRateLimitContext() {
    const context = useContext(ChatMessagesRateLimitContext);
    if (!context) {
        throw new Error(
            "useChatMessagesRateLimitContext must be used within a ChatProvider.",
        );
    }
    return context;
}

export function useChatFilesRateLimitContext() {
    const context = useContext(ChatFilesRateLimitContext);
    if (!context) {
        throw new Error(
            "useChatFilesRateLimitContext must be used within a ChatProvider.",
        );
    }
    return context;
}

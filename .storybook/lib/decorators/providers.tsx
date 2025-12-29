import { QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import React, { useMemo, useState } from "react";
import { fn } from "storybook/test";

import { Toaster } from "../../../src/components/ui/sonner";
import { SessionSyncProvider } from "../../../src/features/auth/providers";
import type {
    ChatUploadedFile,
    DBChatId,
    DBChatVisibility,
    UIChatMessage,
} from "../../../src/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatFilesContext,
    ChatFilesRateLimitContext,
    ChatHandlersContext,
    ChatMessagesRateLimitContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
    ChatStatusContext,
} from "../../../src/features/chat/providers";
import type {
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "../../../src/features/user/lib/types";
import type { UIUser } from "../../../src/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionContext,
} from "../../../src/features/user/providers";
import { MOCK_CHAT_ID } from "../mocks/chats";
import { MOCK_CHAT_STATUS } from "../mocks/messages";
import { MOCK_USER_ID } from "../mocks/users";
import { createQueryClient } from "../utils/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

type UserSessionProviderProps = {
    children: React.ReactNode;
    user?: UIUser | null;
};

export function UserSessionProvider({
    children,
    user,
}: UserSessionProviderProps) {
    return (
        <QueryProvider>
            <UserSessionContext.Provider
                value={{ user: user ?? null, setUser: fn() }}
            >
                {children}
            </UserSessionContext.Provider>
        </QueryProvider>
    );
}

type AppProvidersProps = {
    children: React.ReactNode;
    status?: ChatStatus;
    selectedFiles?: File[];
    isUploadingFiles?: boolean;
    rateLimitMessages?: UserMessagesRateLimitResult;
    rateLimit?: UserMessagesRateLimitResult;
    rateLimitFiles?: UserFilesRateLimitResult;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    uploadedFiles?: ChatUploadedFile[];
    handleFileSelect?: (files: File[]) => void;
    handleFileRemove?: (file: File) => void;
    messages?: UIChatMessage[];
    chatId?: DBChatId;
    error?: Error;
    user?: UIUser | null;
};

export function AppProviders({
    children,
    status,
    selectedFiles = [],
    isUploadingFiles = false,
    rateLimitMessages,
    rateLimit,
    rateLimitFiles,
    isOwner,
    visibility,
    uploadedFiles: initialUploadedFiles = [],
    handleFileSelect: customHandleFileSelect,
    handleFileRemove: customHandleFileRemove,
    messages = [],
    chatId = MOCK_CHAT_ID,
    error,
    user,
}: AppProvidersProps) {
    const effectiveRateLimitMessages = rateLimitMessages ?? rateLimit;
    const [files, setFiles] = useState<File[]>(selectedFiles);
    const [uploadedFiles] = useState<ChatUploadedFile[]>(initialUploadedFiles);

    const chatFilesContextValue = useMemo(
        () => ({
            selectedFiles: files,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect:
                customHandleFileSelect ??
                fn((newFiles: File[]) => {
                    setFiles(prev => [...prev, ...newFiles]);
                }),
            handleFileRemove:
                customHandleFileRemove ??
                fn((file: File) => {
                    setFiles(prev => prev.filter(f => f !== file));
                }),
        }),
        [
            files,
            uploadedFiles,
            isUploadingFiles,
            customHandleFileSelect,
            customHandleFileRemove,
        ],
    );

    const chatHandlersContextValue = useMemo(
        () => ({
            handleSendMessage: fn(),
            handleStop: fn(),
            handleUserRegenerate: fn(),
            handleAssistantRegenerate: fn(),
        }),
        [],
    );

    const chatStatusContextValue = useMemo(
        () => ({
            status: status ?? MOCK_CHAT_STATUS.READY,
            error,
            isStreaming: status === MOCK_CHAT_STATUS.STREAMING,
            isSubmitted: status === MOCK_CHAT_STATUS.SUBMITTED,
            isReady: status === MOCK_CHAT_STATUS.READY,
            isError: status === MOCK_CHAT_STATUS.ERROR,
        }),
        [status, error],
    );

    const chatMessagesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: effectiveRateLimitMessages,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [effectiveRateLimitMessages],
    );

    const chatFilesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitFiles,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitFiles],
    );

    return (
        <QueryProvider>
            <UserSessionProvider user={user}>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={MOCK_USER_ID}
                                        isNewChat={false}
                                        isOwner={isOwner ?? true}
                                        visibility={visibility}
                                        chatId={chatId}
                                        messages={messages}
                                        userChatPreferences={null}
                                    >
                                        <ChatStatusContext.Provider
                                            value={chatStatusContextValue}
                                        >
                                            <ChatFilesContext.Provider
                                                value={chatFilesContextValue}
                                            >
                                                <ChatHandlersContext.Provider
                                                    value={
                                                        chatHandlersContextValue
                                                    }
                                                >
                                                    <ChatMessagesRateLimitContext.Provider
                                                        value={
                                                            chatMessagesRateLimitContextValue
                                                        }
                                                    >
                                                        <ChatFilesRateLimitContext.Provider
                                                            value={
                                                                chatFilesRateLimitContextValue
                                                            }
                                                        >
                                                            {children}
                                                            <Toaster />
                                                        </ChatFilesRateLimitContext.Provider>
                                                    </ChatMessagesRateLimitContext.Provider>
                                                </ChatHandlersContext.Provider>
                                            </ChatFilesContext.Provider>
                                        </ChatStatusContext.Provider>
                                    </ChatProvider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryProvider>
    );
}

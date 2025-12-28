import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo } from "react";

import { Toaster } from "../../../src/components/ui/sonner";
import { SessionSyncProvider } from "../../../src/features/auth/providers";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "../../../src/features/chat/providers";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "../../../src/features/user/providers";
import { MOCK_CHAT_ID } from "../mocks/chats";
import { MOCK_USER_ID } from "../mocks/users";
import { createQueryClient } from "../utils/query-client";

export function WithQueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export function WithQueryProviderAndToaster({
    children,
}: {
    children: React.ReactNode;
}) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}

export function withChatProviders(Story: React.ComponentType<any>) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <Story />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryClientProvider>
    );
}

export function withChatProvidersAndToaster(Story: React.ComponentType<any>) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <Story />
                    <Toaster />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryClientProvider>
    );
}

export function withCenteredLayout(Story: React.ComponentType<any>) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Story />
        </div>
    );
}

export function withDarkBackground(Story: React.ComponentType<any>) {
    return (
        <div className="bg-zinc-925 min-h-screen p-4">
            <Story />
        </div>
    );
}

export function withChatMessageProviders(Story: React.ComponentType<any>) {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={MOCK_USER_ID}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={MOCK_CHAT_ID}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <div className="w-full max-w-4xl bg-zinc-950 p-8">
                                            <Story />
                                        </div>
                                    </ChatProvider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
}

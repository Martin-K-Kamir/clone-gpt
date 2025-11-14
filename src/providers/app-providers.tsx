"use client";

import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "next-auth/react";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import { UserCacheSyncProvider } from "@/features/user/providers";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <SessionProvider refetchOnWindowFocus={false}>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    {children}
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </SessionProvider>
        </QueryProvider>
    );
}

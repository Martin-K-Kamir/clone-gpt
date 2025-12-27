import React from "react";

import { Toaster } from "../../../src/components/ui/sonner";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "../../../src/features/chat/providers";
import { QueryProvider } from "../../../src/providers/query-provider";

export function withQueryProvider(Story: React.ComponentType<any>) {
    return (
        <QueryProvider>
            <Story />
        </QueryProvider>
    );
}

export function withQueryProviderAndToaster(Story: React.ComponentType<any>) {
    return (
        <QueryProvider>
            <Story />
            <Toaster />
        </QueryProvider>
    );
}

export function withChatProviders(Story: React.ComponentType<any>) {
    return (
        <QueryProvider>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <Story />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryProvider>
    );
}

export function withChatProvidersAndToaster(Story: React.ComponentType<any>) {
    return (
        <QueryProvider>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <div className="bg-zinc-925 flex h-full items-center justify-center">
                        <div className="w-full max-w-2xl">
                            <Story />
                        </div>
                    </div>
                    <Toaster />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryProvider>
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

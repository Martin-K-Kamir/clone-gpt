import { useContext } from "react";

import { ChatCacheSyncContext } from "./chat-cache-sync-provider";

export function useChatCacheSyncContext() {
    const context = useContext(ChatCacheSyncContext);

    if (!context) {
        throw new Error(
            "useChatCacheSyncContext must be used within a ChatCacheSyncProvider",
        );
    }
    return context;
}

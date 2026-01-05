import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    QUERY_USER_CHATS_LIMIT,
    QUERY_USER_CHATS_ORDER_BY,
} from "@/features/chat/lib/constants";
import { getUserChats } from "@/features/chat/services/db";

import {
    ChatSidebarHistoryClient,
    type ChatSidebarHistoryClientProps,
} from "./chat-sidebar-history-client";
import { ChatSidebarHistoryError } from "./chat-sidebar-history-error";

export async function ChatSidebarHistory(
    props: Omit<ChatSidebarHistoryClientProps, "initialData">,
) {
    const session = await auth();
    assertSessionExists(session);

    try {
        const data = await getUserChats({
            userId: session.user.id,
            limit: QUERY_USER_CHATS_LIMIT,
            orderBy: QUERY_USER_CHATS_ORDER_BY,
        });

        return (
            <ChatSidebarHistoryClient
                key={`chat-sidebar-history-${session.user.id}`}
                initialData={data}
                {...props}
            />
        );
    } catch (error) {
        return (
            <ChatSidebarHistoryError
                errorMessage={
                    error instanceof Error
                        ? `${error.message}. Please try again later.`
                        : undefined
                }
            />
        );
    }
}

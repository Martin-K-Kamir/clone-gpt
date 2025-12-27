import { HttpResponse, http } from "msw";

import { QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT } from "../../../src/features/chat/lib/constants";
import { api } from "../../../src/lib/api-response";
import { PLURAL } from "../../../src/lib/constants";
import { createMockChats } from "../mocks/chats";

export function createSharedChatsHandler(
    totalChats: number = 50,
    delay: number = 0,
) {
    return http.get("/api/user-chats/shared", async ({ request }) => {
        try {
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const url = new URL(request.url);
            const limitParam = url.searchParams.get("limit");
            const offsetParam = url.searchParams.get("offset");
            const limit = limitParam
                ? parseInt(limitParam)
                : QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT;
            const offset = offsetParam ? parseInt(offsetParam) : 0;

            const chats = createMockChats(totalChats);
            const paginatedChats = chats.slice(offset, offset + limit);
            const hasNextPage = offset + limit < totalChats;

            const response = api.success.chat.getShared(
                {
                    data: paginatedChats,
                    hasNextPage,
                    totalCount: totalChats,
                    nextOffset: hasNextPage ? offset + limit : undefined,
                },
                { count: PLURAL.MULTIPLE },
            );
            return HttpResponse.json({ ...response });
        } catch (error) {
            console.error("MSW handler error:", error);
            return HttpResponse.json(
                {
                    success: false,
                    status: 500,
                    message: "Failed to fetch user shared chats",
                    path: "chat.getShared",
                    timestamp: Date.now(),
                },
                { status: 500 },
            );
        }
    });
}

export function createEmptySharedChatsHandler() {
    return http.get("/api/user-chats/shared", async () => {
        try {
            const response = api.success.chat.getShared(
                {
                    data: [],
                    hasNextPage: false,
                    totalCount: 0,
                },
                { count: PLURAL.MULTIPLE },
            );
            return HttpResponse.json({ ...response });
        } catch (error) {
            console.error("MSW handler error:", error);
            return HttpResponse.json(
                {
                    success: false,
                    status: 500,
                    message: "Failed to fetch user shared chats",
                    path: "chat.getShared",
                    timestamp: Date.now(),
                },
                { status: 500 },
            );
        }
    });
}

export function createFewSharedChatsHandler(count: number = 5) {
    return http.get("/api/user-chats/shared", async () => {
        try {
            const chats = createMockChats(count);
            const response = api.success.chat.getShared(
                {
                    data: chats,
                    hasNextPage: false,
                    totalCount: count,
                },
                { count: PLURAL.MULTIPLE },
            );
            return HttpResponse.json({ ...response });
        } catch (error) {
            console.error("MSW handler error:", error);
            return HttpResponse.json(
                {
                    success: false,
                    status: 500,
                    message: "Failed to fetch user shared chats",
                    path: "chat.getShared",
                    timestamp: Date.now(),
                },
                { status: 500 },
            );
        }
    });
}

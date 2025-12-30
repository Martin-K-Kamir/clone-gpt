import { HttpResponse, delay, http } from "msw";

import {
    CHAT_VISIBILITY,
    QUERY_USER_CHATS_LIMIT,
    QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT,
} from "../../../src/features/chat/lib/constants";
import type {
    DBChatId,
    DBChatVisibility,
} from "../../../src/features/chat/lib/types";
import { api } from "../../../src/lib/api-response";
import { PLURAL } from "../../../src/lib/constants";
import {
    createMockChats,
    createMockPaginatedChats,
    createMockSearchResults,
    generateChatId,
} from "../mocks/chats";
import { FIXED_DATE } from "../mocks/chats";
import {
    MOCK_ADDITIONAL_SOURCE_PREVIEWS,
    MOCK_SOURCE_PREVIEWS,
    MOCK_SOURCE_SINGLE_PREVIEW,
} from "../mocks/messages";
import {
    createMockDBUser,
    createMockEmptyUserChatPreferences,
    createMockUserChatPreferences,
} from "../mocks/users";

type ResourcePreviewsOptions = {
    previews?: typeof MOCK_SOURCE_PREVIEWS;
    delay?: number | "infinite";
};

export function createResourcePreviewsHandler(
    options: ResourcePreviewsOptions = {},
) {
    const { previews = MOCK_SOURCE_PREVIEWS, delay: delayOption } = options;

    return http.post("/api/resource-previews", async () => {
        if (delayOption === "infinite") {
            await delay("infinite");
        } else if (delayOption) {
            await new Promise(resolve => setTimeout(resolve, delayOption));
        }
        return HttpResponse.json(previews);
    });
}

export function createSingleResourcePreviewsHandler() {
    return createResourcePreviewsHandler({
        previews: [MOCK_SOURCE_SINGLE_PREVIEW],
    });
}

export function createManyResourcePreviewsHandler() {
    return createResourcePreviewsHandler({
        previews: [...MOCK_SOURCE_PREVIEWS, ...MOCK_ADDITIONAL_SOURCE_PREVIEWS],
    });
}

export function createLoadingResourcePreviewsHandler() {
    return createResourcePreviewsHandler({
        delay: "infinite",
    });
}

export function createErrorResourcePreviewsHandler() {
    return http.post("/api/resource-previews", () => {
        return HttpResponse.error();
    });
}

export function createEmptyResourcePreviewsHandler() {
    return createResourcePreviewsHandler({
        previews: [],
    });
}

type UserChatsOptions = {
    length?: number;
    visibility?: DBChatVisibility;
    delay?: number;
};

export function createUserChatsHandler(options: UserChatsOptions = {}) {
    const {
        length = 20,
        visibility = CHAT_VISIBILITY.PRIVATE,
        delay,
    } = options;

    return http.get("/api/user-chats", async () => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const mockData = createMockChats({
            length,
            visibility,
        });

        const response = api.success.chat.get(mockData, {
            count: PLURAL.MULTIPLE,
        });

        return HttpResponse.json({ ...response });
    });
}

type UserChatsPaginatedOptions = {
    length?: number;
    hasNextPage?: boolean;
    visibility?: DBChatVisibility;
    delay?: number;
};

export function createUserChatsPaginatedHandler(
    options: UserChatsPaginatedOptions = {},
) {
    const {
        length = 20,
        visibility = CHAT_VISIBILITY.PRIVATE,
        hasNextPage = true,
        delay,
    } = options;

    return http.get("/api/user-chats", async () => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const mockData = createMockPaginatedChats({
            length,
            hasNextPage,
            visibility,
        });

        const response = api.success.chat.get(mockData, {
            count: PLURAL.MULTIPLE,
        });

        return HttpResponse.json({ ...response });
    });
}

type PaginatedUserChatsOptions = {
    pageLength?: number;
    hasNextPage?: boolean;
    visibility?: DBChatVisibility;
    delay?: number;
};

export function createPaginatedUserChatsHandler(
    options: PaginatedUserChatsOptions = {},
) {
    const {
        pageLength = 20,
        hasNextPage = true,
        visibility = CHAT_VISIBILITY.PRIVATE,
        delay,
    } = options;

    return http.get("/api/user-chats", async ({ request }) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10);
        const limit = parseInt(url.searchParams.get("limit") || "40", 10);

        const mockData = createMockPaginatedChats({
            length: pageLength,
            hasNextPage,
            nextOffset: hasNextPage ? offset + limit : undefined,
            visibility,
        });

        const response = api.success.chat.get(mockData, {
            count: PLURAL.MULTIPLE,
        });

        return HttpResponse.json(response);
    });
}

type InfiniteScrollUserChatsOptions = {
    initialItems?: number;
    additionalPages?: number;
    limit?: number;
    visibility?: DBChatVisibility;
    delay?: number;
};

export function createInfiniteScrollUserChatsHandler(
    options: InfiniteScrollUserChatsOptions = {},
) {
    const {
        initialItems = 20,
        additionalPages = 5,
        limit = QUERY_USER_CHATS_LIMIT,
        visibility = CHAT_VISIBILITY.PRIVATE,
        delay,
    } = options;

    return http.get("/api/user-chats", async ({ request }) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10);
        const limitParam = parseInt(
            url.searchParams.get("limit") || String(limit),
            10,
        );

        const TOTAL_ITEMS = initialItems + additionalPages * limitParam;
        const itemsLoaded = offset + limitParam;
        const hasNextPage = itemsLoaded < TOTAL_ITEMS;
        const nextOffset = hasNextPage ? offset + limitParam : undefined;

        const remainingItems = TOTAL_ITEMS - offset;
        const pageLength = Math.min(limitParam, remainingItems);

        const pageChats = createMockChats({
            length: pageLength,
            visibility,
        }).map((chat, i) => ({
            ...chat,
            id: generateChatId(offset + i),
        }));

        const response = api.success.chat.get(
            {
                data: pageChats,
                totalCount: TOTAL_ITEMS,
                hasNextPage,
                nextOffset,
            },
            { count: PLURAL.MULTIPLE },
        );

        return HttpResponse.json(response);
    });
}

export function createEmptyUserChatsHandler() {
    return http.get("/api/user-chats", () => {
        const response = api.success.chat.get([], { count: 0 });
        return HttpResponse.json(response);
    });
}

export function createErrorUserChatsHandler(message = "Failed to fetch chats") {
    return http.get("/api/user-chats", () => {
        return HttpResponse.json(api.error(message), { status: 500 });
    });
}

type UserChatsSearchOptions = {
    resultsPerQuery?: number;
    visibility?: DBChatVisibility;
    emptyQueries?: string[];
    delay?: number;
};

export function createUserChatsSearchHandler(
    options: UserChatsSearchOptions = {},
) {
    const {
        resultsPerQuery = 5,
        visibility = CHAT_VISIBILITY.PRIVATE,
        emptyQueries = [],
        delay,
    } = options;

    return http.get("/api/user-chats/search", async ({ request }) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const url = new URL(request.url);
        const query = url.searchParams.get("query") || "";

        if (!query.trim() || emptyQueries.includes(query)) {
            return HttpResponse.json(
                api.success.chat.search({
                    data: [],
                    totalCount: 0,
                    hasNextPage: false,
                }),
            );
        }

        const searchResults = createMockSearchResults(
            query,
            resultsPerQuery,
            0,
            { visibility },
        );

        const response = api.success.chat.search({
            data: searchResults,
            totalCount: searchResults.length,
            hasNextPage: false,
        });

        return HttpResponse.json(response);
    });
}

type PaginatedUserChatsSearchOptions = {
    maxPages?: number;
    resultsPerPage?: number;
    daysPerPage?: number;
    visibility?: DBChatVisibility;
    emptyQueries?: string[];
    delay?: number;
};

export function createPaginatedUserChatsSearchHandler(
    options: PaginatedUserChatsSearchOptions = {},
) {
    const {
        maxPages = 5,
        resultsPerPage = 25,
        daysPerPage = 10,
        visibility = CHAT_VISIBILITY.PRIVATE,
        emptyQueries = [],
        delay,
    } = options;

    return http.get("/api/user-chats/search", async ({ request }) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const url = new URL(request.url);
        const query = url.searchParams.get("query") || "";
        const cursorDate = url.searchParams.get("cursorDate");
        const cursorId = url.searchParams.get("cursorId");
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : resultsPerPage;

        if (!query.trim() || emptyQueries.includes(query)) {
            return HttpResponse.json(
                api.success.chat.search({
                    data: [],
                    totalCount: 0,
                    hasNextPage: false,
                }),
            );
        }

        let pageNumber = 0;
        if (cursorDate && cursorId) {
            const cursorDateObj = new Date(cursorDate);
            const daysDiff = Math.floor(
                (FIXED_DATE.getTime() - cursorDateObj.getTime()) /
                    (1000 * 60 * 60 * 24),
            );
            pageNumber = Math.floor(daysDiff / daysPerPage) + 1;
        }

        const hasNextPage = pageNumber < maxPages - 1;
        const startIndex = pageNumber * limit;

        const searchResults = createMockSearchResults(
            query,
            limit,
            startIndex,
            { visibility },
        );

        const nextCursor = hasNextPage
            ? {
                  date: new Date(
                      FIXED_DATE.getTime() -
                          (pageNumber + 1) * daysPerPage * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  id: `chat-${(pageNumber + 1) * limit}` as DBChatId,
              }
            : undefined;

        const response = api.success.chat.search({
            data: searchResults,
            totalCount: maxPages * limit,
            hasNextPage,
            cursor: nextCursor,
        });

        return HttpResponse.json(response);
    });
}

type SharedChatsOptions = {
    chats?: ReturnType<typeof createMockChats>;
    hasNextPage?: boolean;
    delay?: number;
};

export function createSharedChatsHandler(options: SharedChatsOptions = {}) {
    const { chats, hasNextPage = false, delay } = options;

    return http.get("/api/user-chats/shared", async ({ request }) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const url = new URL(request.url);
        const limitParam = url.searchParams.get("limit");
        const offsetParam = url.searchParams.get("offset");
        const limit = limitParam
            ? parseInt(limitParam, 10)
            : QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT;
        const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

        const chatsData = chats || createMockChats({ length: 50 });
        const paginatedChats = chatsData.slice(offset, offset + limit);
        const hasNextPageResult =
            hasNextPage !== undefined
                ? hasNextPage
                : offset + limit < chatsData.length;

        const response = api.success.chat.getShared(
            {
                data: paginatedChats,
                hasNextPage: hasNextPageResult,
                totalCount: chatsData.length,
                nextOffset: hasNextPageResult ? offset + limit : undefined,
            },
            { count: PLURAL.MULTIPLE },
        );

        return HttpResponse.json(response);
    });
}

export function createEmptySharedChatsHandler() {
    return http.get("/api/user-chats/shared", () => {
        const response = api.success.chat.getShared(
            {
                data: [],
                hasNextPage: false,
                totalCount: 0,
            },
            { count: PLURAL.MULTIPLE },
        );
        return HttpResponse.json(response);
    });
}

type UserOptions = {
    user?: ReturnType<typeof createMockDBUser>;
    delay?: number;
};

export function createUserHandler(options: UserOptions = {}) {
    const { user, delay } = options;

    return http.get("/api/user", async () => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const userData = user || createMockDBUser();

        const response = api.success.user.get(userData);
        return HttpResponse.json(response);
    });
}

type UserChatPreferencesOptions = {
    preferences?: ReturnType<typeof createMockUserChatPreferences>;
    delay?: number | "infinite";
};

export function createUserChatPreferencesHandler(
    options: UserChatPreferencesOptions = {},
) {
    const { preferences, delay: delayOption } = options;

    return http.get("/api/user/chat-preferences", async () => {
        if (delayOption === "infinite") {
            await delay("infinite");
        } else if (delayOption) {
            await new Promise(resolve => setTimeout(resolve, delayOption));
        }

        const preferencesData =
            preferences || createMockEmptyUserChatPreferences();

        const response = api.success.user.getChatPreferences(preferencesData);
        return HttpResponse.json(response);
    });
}

export function createLoadingUserChatPreferencesHandler() {
    return createUserChatPreferencesHandler({ delay: "infinite" });
}

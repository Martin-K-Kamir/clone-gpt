import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { UIChat } from "@/features/chat/lib/types";
import { getUserChatsByDate } from "@/features/chat/services/api";

import { groupByTimePastPeriods } from "@/lib/utils";

import { useUserInitialChatsSearch } from "./use-user-initial-chats-search";

vi.mock("@/features/chat/services/api", () => ({
    getUserChatsByDate: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
    groupByTimePastPeriods: vi.fn(items => items),
    objectValuesToTuple: vi.fn(obj => Object.values(obj)),
}));

const mockGetUserChatsByDate = vi.mocked(getUserChatsByDate);
const mockGroupByTimePastPeriods = vi.mocked(groupByTimePastPeriods);

describe("useUserInitialChatsSearch", () => {
    let queryClient: QueryClient;

    const createWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
    });

    it("should return query result with transformed data", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const chats: UIChat[] = [
            {
                id: chatId1,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: chatId2,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChatsByDate.mockResolvedValue(chats as any);

        const { result } = renderHook(() => useUserInitialChatsSearch(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockGetUserChatsByDate).toHaveBeenCalled();
        expect(result.current.data).toBeDefined();
    });

    it("should add href property to chats", async () => {
        const chatId = generateChatId();
        const chats: UIChat[] = [
            {
                id: chatId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChatsByDate.mockResolvedValue(chats as any);

        const { result } = renderHook(() => useUserInitialChatsSearch(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        const transformedData = mockGroupByTimePastPeriods.mock.calls[0]?.[0];
        if (Array.isArray(transformedData) && transformedData.length > 0) {
            expect(transformedData[0]).toHaveProperty(
                "href",
                `/chat/${chatId}`,
            );
        }
    });

    it("should sort chats by updatedAt in descending order", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const chats: UIChat[] = [
            {
                id: chatId1,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: chatId2,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChatsByDate.mockResolvedValue(chats as any);

        renderHook(() => useUserInitialChatsSearch(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockGroupByTimePastPeriods).toHaveBeenCalled();
        });

        const sortedData = mockGroupByTimePastPeriods.mock.calls[0]?.[0];
        if (Array.isArray(sortedData) && sortedData.length === 2) {
            expect((sortedData[0] as any).id).toBe(chatId2);
            expect((sortedData[1] as any).id).toBe(chatId1);
        }
    });

    it("should deduplicate chats by id", async () => {
        const chatId = generateChatId();
        const chats: UIChat[] = [
            {
                id: chatId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: chatId,
                title: "Chat 1 Duplicate",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChatsByDate.mockResolvedValue(chats as any);

        renderHook(() => useUserInitialChatsSearch(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockGroupByTimePastPeriods).toHaveBeenCalled();
        });

        const dedupedData = mockGroupByTimePastPeriods.mock.calls[0]?.[0];
        if (Array.isArray(dedupedData)) {
            const uniqueIds = new Set(dedupedData.map((chat: any) => chat.id));
            expect(uniqueIds.size).toBe(1);
        }
    });

    it("should group chats by time periods", async () => {
        const chatId = generateChatId();
        const chats: UIChat[] = [
            {
                id: chatId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChatsByDate.mockResolvedValue(chats as any);

        const { result } = renderHook(() => useUserInitialChatsSearch(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockGroupByTimePastPeriods).toHaveBeenCalledWith(
            expect.any(Array),
            expect.any(Function),
        );
    });

    it("should pass options to getUserChatsByDate", async () => {
        const from = new Date("2024-01-01");
        const limit = 10;
        const orderBy = "updatedAt" as const;

        mockGetUserChatsByDate.mockResolvedValue([]);

        renderHook(
            () =>
                useUserInitialChatsSearch({
                    from,
                    limit,
                    orderBy,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockGetUserChatsByDate).toHaveBeenCalled();
        });

        expect(mockGetUserChatsByDate).toHaveBeenCalledWith({
            from,
            limit,
            orderBy,
        });
    });

    it("should use initialData when provided", () => {
        const chatId = generateChatId();
        const initialData: UIChat[] = [
            {
                id: chatId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        const { result } = renderHook(
            () => useUserInitialChatsSearch({ initialData }),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.data).toBeDefined();
    });
});

import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode, createRef } from "react";
import { useDebounceValue } from "usehooks-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatSearchResult } from "@/features/chat/lib/types";
import { searchUserChats } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tag";

import { useInView } from "@/hooks";

import { useInfiniteSearchUserChats } from "./use-infinite-search-user-chats";

vi.mock("@/features/chat/services/api", () => ({
    searchUserChats: vi.fn(),
}));

vi.mock("@/hooks", () => ({
    useInView: vi.fn(),
}));

vi.mock("usehooks-ts", () => ({
    useDebounceValue: vi.fn(),
}));

const mockSearchUserChats = vi.mocked(searchUserChats);
const mockUseInView = vi.mocked(useInView);
const mockUseDebounceValue = vi.mocked(useDebounceValue);

describe("useInfiniteSearchUserChats", () => {
    let queryClient: QueryClient;
    let ref: React.RefObject<Element | null>;
    let mockOnEnter: (() => void) | undefined;

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

        ref = createRef<Element | null>();
        ref.current = document.createElement("div");

        mockUseDebounceValue.mockReturnValue(["", false] as any);
        mockUseInView.mockImplementation((_ref, options) => {
            if (options && "onEnter" in options) {
                mockOnEnter = options.onEnter;
            }
            return false;
        });
    });

    it("should return initial state when query is empty", () => {
        mockUseDebounceValue.mockReturnValue(["", false] as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("", ref),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.isSearching).toBe(false);
        expect(result.current.isEmpty).toBe(false);
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isDebouncing).toBe(false);
        expect(result.current.searchResults).toEqual([]);
        expect(result.current.hasResults).toBe(false);
        expect(typeof result.current.fetchNextPage).toBe("function");
    });

    it("should indicate searching state when query is being typed and pending", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
        } as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test", ref),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(result.current.isSearching).toBeDefined();
        });
    });

    it("should indicate debouncing state when query differs from debounced query", () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test query", ref),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.isDebouncing).toBe(true);
    });

    it("should fetch search results when debounced query is available", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const searchResults: DBChatSearchResult[] = [
            {
                id: chatId,
                title: "Chat 1",
                snippet: "snippet 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                userId,
            },
        ];

        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: searchResults,
            hasNextPage: false,
        } as any);

        renderHook(() => useInfiniteSearchUserChats("test", ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockSearchUserChats).toHaveBeenCalled();
        });

        expect(mockSearchUserChats).toHaveBeenCalledWith({
            query: "test",
            cursor: undefined,
            limit: undefined,
        });
    });

    it("should add href property to search results from cache", () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const cachedResults: DBChatSearchResult[] = [
            {
                id: chatId,
                title: "Chat 1",
                snippet: "snippet 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                userId,
            },
        ];

        queryClient.setQueryData([tag.userChatsSearch(), "test"], {
            pages: [
                {
                    data: cachedResults,
                    hasNextPage: false,
                },
            ],
            pageParams: [undefined],
        } as any);

        mockUseDebounceValue.mockReturnValue(["test", false] as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test", ref),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.searchResults).toEqual([
            {
                ...cachedResults[0],
                href: `/chat/${chatId}`,
            },
        ]);
        expect(result.current.hasResults).toBe(true);
    });

    it("should indicate empty state when no results found and query is typed", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
        } as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test", ref),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(result.current.isEmpty).toBe(true);
        });
    });

    it("should indicate error state when search fails", async () => {
        const error = new Error("Search failed");

        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockRejectedValue(error);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test", ref),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
        });

        await waitFor(
            () => {
                expect(result.current.isError).toBeTruthy();
            },
            { timeout: 3000 },
        );
    });

    it("should fetch next page when ref enters view and hasNextPage is true", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            cursor: "cursor-1" as any,
        } as any);

        renderHook(() => useInfiniteSearchUserChats("test", ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockUseInView).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockSearchUserChats).toHaveBeenCalled();
        });

        act(() => {
            mockOnEnter?.();
        });

        await waitFor(() => {
            expect(mockSearchUserChats.mock.calls.length).toBeGreaterThan(1);
        });
    });

    it("should not fetch next page when ref enters view but hasNextPage is false", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
        } as any);

        const { result } = renderHook(
            () => useInfiniteSearchUserChats("test", ref),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockSearchUserChats).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(false);
        });

        const callCountBefore = mockSearchUserChats.mock.calls.length;

        act(() => {
            mockOnEnter?.();
        });

        await waitFor(() => {
            expect(mockSearchUserChats.mock.calls.length).toBe(callCountBefore);
        });
    });

    it("should use custom debounce time", () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);

        renderHook(
            () =>
                useInfiniteSearchUserChats("test", ref, {
                    debounceTime: 500,
                }),
            {
                wrapper: createWrapper,
            },
        );

        expect(mockUseDebounceValue).toHaveBeenCalledWith("test", 500);
    });

    it("should use custom stale time", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
        } as any);

        renderHook(
            () =>
                useInfiniteSearchUserChats("test", ref, {
                    staleTime: 1000 * 60 * 5,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockSearchUserChats).toHaveBeenCalled();
        });
    });

    it("should use custom limit in search query", async () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);
        mockSearchUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
        } as any);

        renderHook(
            () =>
                useInfiniteSearchUserChats("test", ref, {
                    limit: 20,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockSearchUserChats).toHaveBeenCalledWith({
                query: "test",
                cursor: undefined,
                limit: 20,
            });
        });
    });

    it("should pass threshold to useInView", () => {
        mockUseDebounceValue.mockReturnValue(["test", false] as any);

        renderHook(
            () =>
                useInfiniteSearchUserChats("test", ref, {
                    threshold: 0.5,
                }),
            {
                wrapper: createWrapper,
            },
        );

        expect(mockUseInView).toHaveBeenCalledWith(ref, {
            onEnter: expect.any(Function),
            threshold: 0.5,
        });
    });
});

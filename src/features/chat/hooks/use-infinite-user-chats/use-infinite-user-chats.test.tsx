import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode, createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UIChat } from "@/features/chat/lib/types";
import { useChatOffsetContext } from "@/features/chat/providers";
import { getUserChats } from "@/features/chat/services/api";

import { useInView } from "@/hooks";

import { useInfiniteUserChats } from "./use-infinite-user-chats";

vi.mock("@/features/chat/services/api", () => ({
    getUserChats: vi.fn(),
}));

vi.mock("@/features/chat/providers", () => ({
    useChatOffsetContext: vi.fn(),
}));

vi.mock("@/hooks", () => ({
    useInView: vi.fn(),
}));

const mockGetUserChats = vi.mocked(getUserChats);
const mockUseChatOffsetContext = vi.mocked(useChatOffsetContext);
const mockUseInView = vi.mocked(useInView);

describe("useInfiniteUserChats", () => {
    let queryClient: QueryClient;
    let ref: React.RefObject<HTMLDivElement | null>;
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

        ref = createRef<HTMLDivElement | null>();
        ref.current = document.createElement("div");

        mockUseChatOffsetContext.mockReturnValue({
            clientOffset: 0,
        } as any);

        mockUseInView.mockImplementation((_ref, options) => {
            if (options && "onEnter" in options) {
                mockOnEnter = options.onEnter;
            }
            return false;
        });
    });

    it("should return chats from all pages", async () => {
        const chats: UIChat[] = [
            {
                id: "chat-1" as any,
                title: "Chat 1",
                visibility: "private" as any,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        mockGetUserChats.mockResolvedValue({
            data: chats,
            hasNextPage: false,
            totalCount: 1,
        } as any);

        const { result } = renderHook(() => useInfiniteUserChats(ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.chats).toBeDefined();
        });

        expect(result.current.chats).toEqual(chats);
    });

    it("should indicate if there is a next page", async () => {
        mockGetUserChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            nextOffset: 10,
            totalCount: 20,
        } as any);

        const { result } = renderHook(() => useInfiniteUserChats(ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(true);
        });
    });

    it("should fetch next page when ref enters view", async () => {
        mockGetUserChats
            .mockResolvedValueOnce({
                data: [],
                hasNextPage: true,
                nextOffset: 10,
                totalCount: 20,
            } as any)
            .mockResolvedValueOnce({
                data: [],
                hasNextPage: false,
                totalCount: 20,
            } as any);

        renderHook(() => useInfiniteUserChats(ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockGetUserChats).toHaveBeenCalled();
        });

        act(() => {
            mockOnEnter?.();
        });

        await waitFor(() => {
            expect(mockGetUserChats.mock.calls.length).toBeGreaterThan(1);
        });
    });

    it("should not fetch next page when hasNextPage is false", async () => {
        mockGetUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 10,
        } as any);

        const { result } = renderHook(() => useInfiniteUserChats(ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(false);
        });

        const callCountBefore = mockGetUserChats.mock.calls.length;

        act(() => {
            mockOnEnter?.();
        });

        await waitFor(() => {
            expect(mockGetUserChats.mock.calls.length).toBe(callCountBefore);
        });
    });

    it("should use clientOffset in query", async () => {
        mockUseChatOffsetContext.mockReturnValue({
            clientOffset: 5,
        } as any);

        mockGetUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        renderHook(() => useInfiniteUserChats(ref), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockGetUserChats).toHaveBeenCalledWith({
                limit: undefined,
                orderBy: undefined,
                offset: 5,
            });
        });
    });

    it("should pass limit and orderBy to getUserChats", async () => {
        mockGetUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        renderHook(
            () =>
                useInfiniteUserChats(ref, {
                    limit: 20,
                    orderBy: "updatedAt",
                }),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockGetUserChats).toHaveBeenCalledWith({
                limit: 20,
                orderBy: "updatedAt",
                offset: 0,
            });
        });
    });

    it("should use initialData when provided", () => {
        const initialData = {
            data: [
                {
                    id: "chat-1" as any,
                    title: "Chat 1",
                    visibility: "private" as any,
                    createdAt: "2024-01-01T00:00:00Z",
                    updatedAt: "2024-01-03T00:00:00Z",
                    visibleAt: "2024-01-01T00:00:00Z",
                },
            ],
            hasNextPage: false,
            totalCount: 1,
        };

        const { result } = renderHook(
            () =>
                useInfiniteUserChats(ref, {
                    initialData,
                }),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.chats).toEqual(initialData.data);
    });

    it("should pass threshold to useInView", async () => {
        mockGetUserChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        renderHook(
            () =>
                useInfiniteUserChats(ref, {
                    threshold: 0.5,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await waitFor(() => {
            expect(mockUseInView).toHaveBeenCalledWith(ref, {
                onEnter: expect.any(Function),
                threshold: 0.5,
            });
        });
    });
});

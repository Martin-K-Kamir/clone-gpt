import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserSharedChats } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tag";

import { useUserSharedChats } from "./use-user-shared-chats";

vi.mock("@/features/chat/services/api", () => ({
    getUserSharedChats: vi.fn(),
}));

const mockGetUserSharedChats = vi.mocked(getUserSharedChats);

describe("useUserSharedChats", () => {
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

    it("should return initial state with offset 0", () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        const { result } = renderHook(() => useUserSharedChats(), {
            wrapper: createWrapper,
        });

        expect(result.current.offset).toBe(0);
        expect(typeof result.current.setOffset).toBe("function");
        expect(typeof result.current.onNextPage).toBe("function");
        expect(typeof result.current.onPrevPage).toBe("function");
        expect(typeof result.current.onFirstPage).toBe("function");
        expect(typeof result.current.onLastPage).toBe("function");
    });

    it("should fetch chats with offset and limit", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(mockGetUserSharedChats).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
            });
        });
    });

    it("should update offset when onNextPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 30,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(10);
        });
    });

    it("should not exceed last page when onNextPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 25,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(10);
        });

        act(() => {
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(20);
        });

        act(() => {
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(20);
        });
    });

    it("should update offset when onPrevPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 30,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(10);
        });

        act(() => {
            result.current.onPrevPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(0);
        });
    });

    it("should not go below 0 when onPrevPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 10,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onPrevPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(0);
        });
    });

    it("should reset offset to 0 when onFirstPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 30,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onNextPage();
            result.current.onNextPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(20);
        });

        act(() => {
            result.current.onFirstPage();
        });

        expect(result.current.offset).toBe(0);
    });

    it("should set offset to last page when onLastPage is called", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 25,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.onLastPage();
        });

        await waitFor(() => {
            expect(result.current.offset).toBe(20);
        });
    });

    it("should not call pagination functions when limit is not provided", async () => {
        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        } as any);

        const { result } = renderHook(() => useUserSharedChats(), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        const initialOffset = result.current.offset;

        act(() => {
            result.current.onNextPage();
            result.current.onPrevPage();
            result.current.onLastPage();
        });

        expect(result.current.offset).toBe(initialOffset);
    });

    it("should prefetch next page when hasNextPage is true", async () => {
        const prefetchQuerySpy = vi.spyOn(queryClient, "prefetchQuery");

        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: true,
            totalCount: 30,
        } as any);

        renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(prefetchQuerySpy).toHaveBeenCalledWith({
                queryKey: [tag.userSharedChats(), 10, 10],
                queryFn: expect.any(Function),
            });
        });
    });

    it("should prefetch previous page when offset is greater than 0", async () => {
        const prefetchQuerySpy = vi.spyOn(queryClient, "prefetchQuery");

        mockGetUserSharedChats.mockResolvedValue({
            data: [],
            hasNextPage: false,
            totalCount: 10,
        } as any);

        const { result } = renderHook(() => useUserSharedChats({ limit: 10 }), {
            wrapper: createWrapper,
        });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
        });

        act(() => {
            result.current.setOffset(10);
        });

        await waitFor(() => {
            expect(prefetchQuerySpy).toHaveBeenCalledWith({
                queryKey: [tag.userSharedChats(), 0, 10],
                queryFn: expect.any(Function),
            });
        });
    });
});

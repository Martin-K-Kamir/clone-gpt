import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { updateManyChatsVisibility } from "@/features/chat/services/actions";

import { useBatchUserSharedChats } from "./use-batch-user-shared-chats";

vi.mock("@/features/chat/providers", () => ({
    useChatCacheSyncContext: vi.fn(),
}));

vi.mock("@/features/chat/services/actions", () => ({
    updateManyChatsVisibility: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

const mockUseChatCacheSyncContext = vi.mocked(useChatCacheSyncContext);
const mockUpdateManyChatsVisibility = vi.mocked(updateManyChatsVisibility);
const mockToastError = vi.mocked(toast.error);

describe("useBatchUserSharedChats", () => {
    let queryClient: QueryClient;
    let mockInvalidateSharedChats: ReturnType<typeof vi.fn>;
    let mockUpdateChatVisibility: ReturnType<typeof vi.fn>;

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

        mockInvalidateSharedChats = vi.fn();
        mockUpdateChatVisibility = vi.fn();

        mockUseChatCacheSyncContext.mockReturnValue({
            invalidateSharedChats: mockInvalidateSharedChats,
            updateChatVisibility: mockUpdateChatVisibility,
        } as any);
    });

    it("should return batch operation, success handler, and error handler", () => {
        const { result } = renderHook(
            () => useBatchUserSharedChats(CHAT_VISIBILITY.PRIVATE),
            {
                wrapper: createWrapper,
            },
        );

        expect(typeof result.current.batchOperation).toBe("function");
        expect(typeof result.current.handleBatchSuccess).toBe("function");
        expect(typeof result.current.handleBatchError).toBe("function");
    });

    it("should return success result when batch operation succeeds", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const chatIds: DBChatId[] = [chatId1, chatId2];
        const chats: DBChat[] = [
            { id: chatId1 } as DBChat,
            { id: chatId2 } as DBChat,
        ];

        mockUpdateManyChatsVisibility.mockResolvedValue({
            success: true,
            data: chats,
        } as any);

        const { result } = renderHook(
            () => useBatchUserSharedChats(CHAT_VISIBILITY.PRIVATE),
            {
                wrapper: createWrapper,
            },
        );

        const batchResult = await act(async () => {
            return result.current.batchOperation(undefined, chatIds);
        });

        expect(batchResult.success).toBe(true);
    });

    it("should throw error when batch operation fails", async () => {
        const chatId = generateChatId();
        const chatIds: DBChatId[] = [chatId];
        const errorMessage = "Operation failed";

        mockUpdateManyChatsVisibility.mockResolvedValue({
            success: false,
            message: errorMessage,
        } as any);

        const { result } = renderHook(
            () => useBatchUserSharedChats(CHAT_VISIBILITY.PRIVATE),
            {
                wrapper: createWrapper,
            },
        );

        await expect(
            act(async () => {
                await result.current.batchOperation(undefined, chatIds);
            }),
        ).rejects.toThrow(errorMessage);
    });

    it("should update visibility and invalidate shared chats on success", () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const chats: DBChat[] = [
            { id: chatId1 } as DBChat,
            { id: chatId2 } as DBChat,
        ];
        const response = {
            success: true,
            data: chats,
        } as any;

        const { result } = renderHook(
            () => useBatchUserSharedChats(CHAT_VISIBILITY.PUBLIC),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleBatchSuccess(response);
        });

        expect(mockInvalidateSharedChats).toHaveBeenCalled();
        expect(mockUpdateChatVisibility).toHaveBeenCalledTimes(chats.length);
    });

    it("should show error toast on error", () => {
        const errorMessage = "Batch operation failed";
        const error = {
            message: errorMessage,
        } as any;

        const { result } = renderHook(
            () => useBatchUserSharedChats(CHAT_VISIBILITY.PRIVATE),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleBatchError(error);
        });

        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });
});

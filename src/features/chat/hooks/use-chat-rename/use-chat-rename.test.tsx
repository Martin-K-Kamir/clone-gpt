import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { updateChatTitle } from "@/features/chat/services/actions";

import { useClickOutside, useEventListener } from "@/hooks";

import { useChatRename } from "./use-chat-rename";

vi.mock("@/features/chat/providers", () => ({
    useChatCacheSyncContext: vi.fn(),
}));

vi.mock("@/features/chat/services/actions", () => ({
    updateChatTitle: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock("@/hooks", () => ({
    useClickOutside: vi.fn(),
    useEventListener: vi.fn(),
}));

const mockUseChatCacheSyncContext = vi.mocked(useChatCacheSyncContext);
const mockUpdateChatTitle = vi.mocked(updateChatTitle);
const mockToastError = vi.mocked(toast.error);
const mockUseClickOutside = vi.mocked(useClickOutside);
const mockUseEventListener = vi.mocked(useEventListener);

describe("useChatRename", () => {
    let chatId: DBChatId;
    let initialTitle: string;
    let inputRef: React.RefObject<HTMLInputElement | null>;
    let mockUpdateChatTitleFn: ReturnType<typeof vi.fn>;
    let mockInvalidateSharedChats: ReturnType<typeof vi.fn>;
    let mockUpdateInitialUserChatsSearchTitle: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        chatId = generateChatId();
        initialTitle = "Original Title";

        const input = document.createElement("input");
        inputRef = createRef<HTMLInputElement>();
        inputRef.current = input;

        mockUpdateChatTitleFn = vi.fn();
        mockInvalidateSharedChats = vi.fn();
        mockUpdateInitialUserChatsSearchTitle = vi.fn();

        mockUseChatCacheSyncContext.mockReturnValue({
            updateChatTitle: mockUpdateChatTitleFn,
            invalidateSharedChats: mockInvalidateSharedChats,
            updateInitialUserChatsSearchTitle:
                mockUpdateInitialUserChatsSearchTitle,
        } as any);

        mockUseClickOutside.mockReturnValue(undefined);
        mockUseEventListener.mockReturnValue(undefined);
    });

    it("should return initial state", () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        expect(result.current.isRenaming).toBe(false);
        expect(result.current.optimisticTitle).toBe(initialTitle);
        expect(typeof result.current.startRenaming).toBe("function");
        expect(typeof result.current.cancelRenaming).toBe("function");
        expect(typeof result.current.handleRename).toBe("function");
    });

    it("should start renaming mode when startRenaming is called", () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        expect(result.current.isRenaming).toBe(true);
    });

    it("should cancel renaming mode when cancelRenaming is called", () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        expect(result.current.isRenaming).toBe(true);

        act(() => {
            result.current.cancelRenaming();
        });

        expect(result.current.isRenaming).toBe(false);
    });

    it("should not rename when not in renaming mode", async () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        if (inputRef.current) {
            inputRef.current.value = "New Title";
        }

        await act(async () => {
            await result.current.handleRename();
        });

        expect(mockUpdateChatTitle).not.toHaveBeenCalled();
    });

    it("should not rename when input value is empty", async () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = "   ";
        }

        await act(async () => {
            await result.current.handleRename();
        });

        expect(mockUpdateChatTitle).not.toHaveBeenCalled();
    });

    it("should not rename when input value matches current title", async () => {
        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = initialTitle;
        }

        await act(async () => {
            await result.current.handleRename();
        });

        expect(mockUpdateChatTitle).not.toHaveBeenCalled();
    });

    it("should update optimistic title and rename chat successfully", async () => {
        const newTitle = "New Title";
        mockUpdateChatTitle.mockResolvedValue({
            success: true,
            message: "Chat renamed",
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(
            () => {
                expect(result.current.optimisticTitle).toBe(newTitle);
            },
            { timeout: 3000 },
        );

        await waitFor(() => {
            expect(result.current.isRenaming).toBe(false);
        });

        expect(mockUpdateChatTitle).toHaveBeenCalledWith({
            chatId,
            newTitle,
        });
        expect(mockUpdateChatTitleFn).toHaveBeenCalledWith({
            chatId,
            newTitle,
            scope: undefined,
        });
        expect(mockUpdateInitialUserChatsSearchTitle).toHaveBeenCalledWith({
            chatId,
            newTitle,
            scope: undefined,
        });
        expect(mockInvalidateSharedChats).toHaveBeenCalled();
    });

    it("should trim whitespace from new title", async () => {
        const newTitle = "  Trimmed Title  ";
        const trimmedTitle = "Trimmed Title";
        mockUpdateChatTitle.mockResolvedValue({
            success: true,
            message: "Chat renamed",
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(
            () => {
                expect(result.current.optimisticTitle).toBe(trimmedTitle);
            },
            { timeout: 3000 },
        );

        expect(mockUpdateChatTitle).toHaveBeenCalledWith({
            chatId,
            newTitle: trimmedTitle,
        });
    });

    it("should revert optimistic update and show error on failure", async () => {
        const newTitle = "New Title";
        const errorMessage = "Failed to rename";
        mockUpdateChatTitle.mockResolvedValue({
            success: false,
            message: errorMessage,
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(() => {
            expect(result.current.optimisticTitle).toBe(initialTitle);
        });

        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
        expect(mockUpdateChatTitleFn).not.toHaveBeenCalled();
    });

    it("should call onSuccess callback when rename succeeds", async () => {
        const newTitle = "New Title";
        const onSuccess = vi.fn();
        mockUpdateChatTitle.mockResolvedValue({
            success: true,
            message: "Chat renamed",
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
                onSuccess,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it("should call onError callback when rename fails", async () => {
        const newTitle = "New Title";
        const errorMessage = "Failed to rename";
        const onError = vi.fn();
        mockUpdateChatTitle.mockResolvedValue({
            success: false,
            message: errorMessage,
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
                onError,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(errorMessage);
        });
    });

    it("should exit renaming mode after handleRename is called", async () => {
        const newTitle = "New Title";
        mockUpdateChatTitle.mockResolvedValue({
            success: true,
            message: "Chat renamed",
        } as any);

        const { result } = renderHook(() =>
            useChatRename({
                inputRef,
                title: initialTitle,
                chatId,
            }),
        );

        act(() => {
            result.current.startRenaming();
        });

        expect(result.current.isRenaming).toBe(true);

        if (inputRef.current) {
            inputRef.current.value = newTitle;
        }

        act(() => {
            result.current.handleRename();
        });

        await waitFor(() => {
            expect(result.current.isRenaming).toBe(false);
        });
    });
});

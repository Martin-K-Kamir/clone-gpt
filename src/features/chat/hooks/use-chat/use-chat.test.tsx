import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChatFiles } from "@/features/chat/hooks";
import { CHAT_ROLE, CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { chatTextSchema } from "@/features/chat/lib/schemas";
import type { UIChatMessage } from "@/features/chat/lib/types";
import {
    createUserMessage,
    findMessageIndex,
    findNextAssistantMessage,
    handleNewChatFinish,
    handleUpdateChatFinish,
    updateMessageParts,
} from "@/features/chat/lib/utils";
import {
    useChatCacheSyncContext,
    useChatSidebarContext,
} from "@/features/chat/providers";

import { getUserChatPreferences } from "@/features/user/services/api";

import { getParseErrors } from "@/lib/utils";

import { useUuid } from "@/hooks";

import { useChat } from "./use-chat";

const mockUseChatFn = vi.hoisted(() => vi.fn());
vi.mock("@ai-sdk/react", () => ({
    useChat: mockUseChatFn,
}));

vi.mock("@/features/chat/hooks", () => ({
    useChatFiles: vi.fn(),
}));

vi.mock("@/features/chat/providers", () => ({
    useChatCacheSyncContext: vi.fn(),
    useChatSidebarContext: vi.fn(),
}));

vi.mock("@/features/user/services/api", () => ({
    getUserChatPreferences: vi.fn(),
}));

vi.mock("@/features/chat/lib/utils", () => ({
    createUserMessage: vi.fn(),
    findMessageIndex: vi.fn(),
    findNextAssistantMessage: vi.fn(),
    handleNewChatFinish: vi.fn(),
    handleUpdateChatFinish: vi.fn(),
    updateMessageParts: vi.fn(),
    fetchWithErrorHandlers: vi.fn(),
}));

vi.mock("@/features/chat/lib/schemas", () => ({
    chatTextSchema: {
        safeParse: vi.fn(),
    },
}));

vi.mock("@/lib/utils", () => ({
    getParseErrors: vi.fn(),
    objectValuesToTuple: vi.fn(obj => Object.values(obj)),
}));

vi.mock("@/hooks", () => ({
    useUuid: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

const mockUseChatFiles = vi.mocked(useChatFiles);
const mockUseChatCacheSyncContext = vi.mocked(useChatCacheSyncContext);
const mockUseChatSidebarContext = vi.mocked(useChatSidebarContext);
const mockGetUserChatPreferences = vi.mocked(getUserChatPreferences);
const mockCreateUserMessage = vi.mocked(createUserMessage);
const mockFindMessageIndex = vi.mocked(findMessageIndex);
const mockFindNextAssistantMessage = vi.mocked(findNextAssistantMessage);
const mockHandleNewChatFinish = vi.mocked(handleNewChatFinish);
const mockHandleUpdateChatFinish = vi.mocked(handleUpdateChatFinish);
const mockUpdateMessageParts = vi.mocked(updateMessageParts);
const mockChatTextSchema = vi.mocked(chatTextSchema);
const mockGetParseErrors = vi.mocked(getParseErrors);
const mockUseUuid = vi.mocked(useUuid);
const mockToastError = vi.mocked(toast.error);

describe("useChat", () => {
    let queryClient: QueryClient;
    const userId = generateUserId();
    const chatId = generateChatId();
    let mockRegenerate: ReturnType<typeof vi.fn>;
    let mockSendMessage: ReturnType<typeof vi.fn>;
    let mockStop: ReturnType<typeof vi.fn>;
    let mockSetMessages: ReturnType<typeof vi.fn>;

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

        mockRegenerate = vi.fn();
        mockSendMessage = vi.fn();
        mockStop = vi.fn();
        mockSetMessages = vi.fn();

        mockUseChatFn.mockReturnValue({
            id: chatId,
            messages: [],
            status: "ready",
            error: null,
            regenerate: mockRegenerate,
            stop: mockStop,
            sendMessage: mockSendMessage,
            setMessages: mockSetMessages,
        } as any);

        mockUseChatFiles.mockReturnValue({
            selectedFiles: [],
            uploadedFiles: [],
            isUploadingFiles: false,
            handleFileSelect: vi.fn(),
            handleFileRemove: vi.fn(),
            handleClearFiles: vi.fn(),
        } as any);

        mockUseChatCacheSyncContext.mockReturnValue({
            invalidateSharedChats: vi.fn(),
            updateChatVisibility: vi.fn(),
        } as any);

        mockUseChatSidebarContext.mockReturnValue({
            scrollHistoryToTop: vi.fn(),
            setChatHistoryRef: vi.fn(),
        } as any);

        mockGetUserChatPreferences.mockResolvedValue({} as any);

        const newChatId = generateChatId();
        mockUseUuid.mockReturnValue(() => newChatId);

        mockCreateUserMessage.mockReturnValue({
            role: CHAT_ROLE.USER,
            content: "test",
        } as any);

        mockChatTextSchema.safeParse.mockReturnValue({
            success: true,
            data: "test",
        } as any);
    });

    it("should return initial state with chat files and status flags", () => {
        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.chatId).toBe(chatId);
        expect(result.current.messages).toEqual([]);
        expect(result.current.status).toBe("ready");
        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual([]);
        expect(result.current.isUploadingFiles).toBe(false);
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.isError).toBe(false);
        expect(typeof result.current.handleSendMessage).toBe("function");
        expect(typeof result.current.handleAssistantRegenerate).toBe(
            "function",
        );
        expect(typeof result.current.handleUserRegenerate).toBe("function");
        expect(typeof result.current.handleFileSelect).toBe("function");
        expect(typeof result.current.handleFileRemove).toBe("function");
        expect(typeof result.current.handleStop).toBe("function");
    });

    it("should send message when handleSendMessage is called with valid text", () => {
        const mockHandleClearFiles = vi.fn();
        mockUseChatFiles.mockReturnValue({
            selectedFiles: [],
            uploadedFiles: [],
            isUploadingFiles: false,
            handleFileSelect: vi.fn(),
            handleFileRemove: vi.fn(),
            handleClearFiles: mockHandleClearFiles,
        } as any);

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleSendMessage("test message");
        });

        expect(mockChatTextSchema.safeParse).toHaveBeenCalledWith(
            "test message",
        );
        expect(mockCreateUserMessage).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalled();
        expect(mockHandleClearFiles).toHaveBeenCalled();
    });

    it("should show error toast when handleSendMessage is called with invalid text", () => {
        mockChatTextSchema.safeParse.mockReturnValue({
            success: false,
            error: {},
        } as any);
        mockGetParseErrors.mockReturnValue(["Invalid message"]);

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleSendMessage("invalid");
        });

        expect(mockToastError).toHaveBeenCalledWith("Invalid message", {
            duration: 6_000,
        });
        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("should regenerate assistant message when handleAssistantRegenerate is called", () => {
        const messageId = generateMessageId();

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleAssistantRegenerate({ messageId });
        });

        expect(mockRegenerate).toHaveBeenCalledWith({
            messageId,
            body: {
                regeneratedMessageRole: CHAT_ROLE.ASSISTANT,
            },
        });
    });

    it("should regenerate user message when handleUserRegenerate is called", () => {
        const userMessageId = generateMessageId();
        const assistantMessageId = generateMessageId();
        const newMessage = "updated message";

        const messages: UIChatMessage[] = [
            {
                id: userMessageId,
                role: CHAT_ROLE.USER,
                content: "original",
            } as any,
            {
                id: assistantMessageId,
                role: CHAT_ROLE.ASSISTANT,
                content: "response",
            } as any,
        ];

        mockUseChatFn.mockReturnValue({
            id: chatId,
            messages,
            status: "ready",
            error: null,
            regenerate: mockRegenerate,
            stop: mockStop,
            sendMessage: mockSendMessage,
            setMessages: mockSetMessages,
        } as any);

        mockFindMessageIndex.mockReturnValue(0);
        mockFindNextAssistantMessage.mockReturnValue({
            id: assistantMessageId,
        } as any);
        mockUpdateMessageParts.mockReturnValue(messages);

        mockSetMessages.mockImplementation((updater: any) => {
            if (typeof updater === "function") {
                updater(messages);
            }
        });

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleUserRegenerate({
                messageId: userMessageId,
                newMessage,
            });
        });

        expect(mockSetMessages).toHaveBeenCalled();
        expect(mockRegenerate).toHaveBeenCalledWith({
            messageId: assistantMessageId,
            body: {
                regeneratedMessageRole: CHAT_ROLE.USER,
            },
        });
    });

    it("should not regenerate when handleUserRegenerate is called without next assistant message", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                content: "test",
            } as any,
        ];

        mockUseChatFn.mockReturnValue({
            id: chatId,
            messages,
            status: "ready",
            error: null,
            regenerate: mockRegenerate,
            stop: mockStop,
            sendMessage: mockSendMessage,
            setMessages: mockSetMessages,
        } as any);

        mockFindMessageIndex.mockReturnValue(0);
        mockFindNextAssistantMessage.mockReturnValue(null as any);

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            result.current.handleUserRegenerate({
                messageId,
                newMessage: "updated",
            });
        });

        expect(mockRegenerate).not.toHaveBeenCalled();
    });

    it("should call onFinish when chat finishes successfully", () => {
        const onFinish = vi.fn();
        let capturedOnFinish: ((args: any) => Promise<void>) | undefined;

        mockUseChatFn.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                id: chatId,
                messages: [],
                status: "ready",
                error: null,
                regenerate: mockRegenerate,
                stop: mockStop,
                sendMessage: mockSendMessage,
                setMessages: mockSetMessages,
            };
        });

        renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                    onFinish,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            void capturedOnFinish?.({ isError: false });
        });

        expect(onFinish).toHaveBeenCalled();
    });

    it("should not call onFinish when chat finishes with error", () => {
        const onFinish = vi.fn();
        let capturedOnFinish: ((args: any) => Promise<void>) | undefined;

        mockUseChatFn.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                id: chatId,
                messages: [],
                status: "ready",
                error: null,
                regenerate: mockRegenerate,
                stop: mockStop,
                sendMessage: mockSendMessage,
                setMessages: mockSetMessages,
            };
        });

        renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                    onFinish,
                }),
            {
                wrapper: createWrapper,
            },
        );

        act(() => {
            void capturedOnFinish?.({ isError: true });
        });

        expect(onFinish).not.toHaveBeenCalled();
    });

    it("should call onNewChatFinished when new chat finishes", async () => {
        const onNewChatFinished = vi.fn();
        let capturedOnFinish: ((args: any) => Promise<void>) | undefined;

        mockUseChatFn.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                id: chatId,
                messages: [],
                status: "ready",
                error: null,
                regenerate: mockRegenerate,
                stop: mockStop,
                sendMessage: mockSendMessage,
                setMessages: mockSetMessages,
            };
        });

        renderHook(
            () =>
                useChat({
                    userId,
                    isNewChat: true,
                    initialUserChatPreferences: null,
                    onNewChatFinished,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await act(async () => {
            await capturedOnFinish?.({ isError: false });
        });

        await waitFor(() => {
            expect(onNewChatFinished).toHaveBeenCalled();
        });

        expect(mockHandleNewChatFinish).toHaveBeenCalled();
    });

    it("should call onUpdatedChatFinished when existing chat finishes", async () => {
        const onUpdatedChatFinished = vi.fn();
        let capturedOnFinish: ((args: any) => Promise<void>) | undefined;

        mockUseChatFn.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                id: chatId,
                messages: [],
                status: "ready",
                error: null,
                regenerate: mockRegenerate,
                stop: mockStop,
                sendMessage: mockSendMessage,
                setMessages: mockSetMessages,
            };
        });

        renderHook(
            () =>
                useChat({
                    userId,
                    isNewChat: false,
                    initialUserChatPreferences: null,
                    onUpdatedChatFinished,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await act(async () => {
            await capturedOnFinish?.({ isError: false });
        });

        await waitFor(() => {
            expect(onUpdatedChatFinished).toHaveBeenCalled();
        });

        expect(mockHandleUpdateChatFinish).toHaveBeenCalled();
    });

    it("should call onDuplicatedChatFinished when public chat is duplicated", async () => {
        const onDuplicatedChatFinished = vi.fn();
        let capturedOnFinish: ((args: any) => Promise<void>) | undefined;

        mockUseChatFn.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                id: chatId,
                messages: [],
                status: "ready",
                error: null,
                regenerate: mockRegenerate,
                stop: mockStop,
                sendMessage: mockSendMessage,
                setMessages: mockSetMessages,
            };
        });

        renderHook(
            () =>
                useChat({
                    userId,
                    isOwner: false,
                    visibility: CHAT_VISIBILITY.PUBLIC,
                    initialUserChatPreferences: null,
                    onDuplicatedChatFinished,
                }),
            {
                wrapper: createWrapper,
            },
        );

        await act(async () => {
            await capturedOnFinish?.({ isError: false });
        });

        await waitFor(() => {
            expect(onDuplicatedChatFinished).toHaveBeenCalled();
        });

        expect(mockHandleNewChatFinish).toHaveBeenCalled();
    });

    it("should update messages when initialMessages changes", () => {
        const messageId = generateMessageId();
        const initialMessages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                content: "test",
            } as any,
        ];

        const { rerender } = renderHook(
            ({ initialMessages }) =>
                useChat({
                    userId,
                    initialMessages,
                    initialUserChatPreferences: null,
                }),
            {
                initialProps: { initialMessages: [] as UIChatMessage[] },
                wrapper: createWrapper,
            },
        );

        rerender({ initialMessages });

        expect(mockSetMessages).toHaveBeenCalledWith(initialMessages);
    });

    it("should not update messages when initialMessages is unchanged", () => {
        const messageId = generateMessageId();
        const initialMessages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                content: "test",
            } as any,
        ];

        const { rerender } = renderHook(
            ({ initialMessages }) =>
                useChat({
                    userId,
                    initialMessages,
                    initialUserChatPreferences: null,
                }),
            {
                initialProps: { initialMessages },
                wrapper: createWrapper,
            },
        );

        mockSetMessages.mockClear();

        rerender({ initialMessages });

        expect(mockSetMessages).not.toHaveBeenCalled();
    });

    it("should return correct status flags based on status", () => {
        mockUseChatFn.mockReturnValue({
            id: chatId,
            messages: [],
            status: "streaming",
            error: null,
            regenerate: mockRegenerate,
            stop: mockStop,
            sendMessage: mockSendMessage,
            setMessages: mockSetMessages,
        } as any);

        const { result } = renderHook(
            () =>
                useChat({
                    userId,
                    initialUserChatPreferences: null,
                }),
            {
                wrapper: createWrapper,
            },
        );

        expect(result.current.isStreaming).toBe(true);
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.isReady).toBe(false);
        expect(result.current.isError).toBe(false);
    });
});

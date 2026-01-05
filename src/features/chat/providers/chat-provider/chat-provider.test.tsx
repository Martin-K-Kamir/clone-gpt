import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChat } from "@/features/chat/hooks";
import { CHAT_ROLE, CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type {
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";

import {
    useUserFilesRateLimit,
    useUserMessagesRateLimit,
} from "@/features/user/hooks";
import type { DBUserChatPreferences } from "@/features/user/lib/types";

import {
    ChatProvider,
    useChatContext,
    useChatFilesContext,
    useChatFilesRateLimitContext,
    useChatHandlersContext,
    useChatMessagesContext,
    useChatMessagesRateLimitContext,
    useChatStatusContext,
} from "./chat-provider";

vi.mock("@/features/chat/hooks", () => ({
    useChat: vi.fn(),
}));

vi.mock("@/features/user/hooks", () => ({
    useUserMessagesRateLimit: vi.fn(),
    useUserFilesRateLimit: vi.fn(),
}));

const mockUseChat = vi.mocked(useChat);
const mockUseUserMessagesRateLimit = vi.mocked(useUserMessagesRateLimit);
const mockUseUserFilesRateLimit = vi.mocked(useUserFilesRateLimit);

describe("ChatProvider", () => {
    let queryClient: QueryClient;
    const userId = generateUserId();
    const chatId = generateChatId();
    const initialMessages: UIChatMessage[] = [];
    const initialUserChatPreferences: DBUserChatPreferences | null = null;

    const createWrapper = ({
        isNewChat,
        isOwner,
        visibility,
    }: {
        isNewChat?: boolean;
        isOwner?: boolean;
        visibility?: DBChatVisibility;
    } = {}) => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <ChatProvider
                    userId={userId}
                    chatId={chatId}
                    messages={initialMessages}
                    userChatPreferences={initialUserChatPreferences}
                    isNewChat={isNewChat}
                    isOwner={isOwner}
                    visibility={visibility}
                >
                    {children}
                </ChatProvider>
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockUseChat.mockReturnValue({
            chatId,
            messages: initialMessages,
            status: "ready",
            error: undefined,
            selectedFiles: [],
            uploadedFiles: [],
            isUploadingFiles: false,
            isStreaming: false,
            isSubmitted: false,
            isReady: true,
            isError: false,
            handleSendMessage: vi.fn(),
            handleStop: vi.fn(),
            handleAssistantRegenerate: vi.fn(),
            handleUserRegenerate: vi.fn(),
            handleFileSelect: vi.fn(),
            handleFileRemove: vi.fn(),
        } as any);

        const mockRefetch = vi.fn();

        mockUseUserMessagesRateLimit.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
            isPending: false,
            refetch: mockRefetch,
        } as any);

        mockUseUserFilesRateLimit.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
            isPending: false,
            refetch: mockRefetch,
        } as any);
    });

    it("should provide chat context with chatId and initial state", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.chatId).toBe(chatId);
        expect(result.current.isNewChat).toBeUndefined();
        expect(result.current.visibility).toBeUndefined();
        expect(result.current.isOwner).toBeUndefined();
        expect(typeof result.current.setIsOwner).toBe("function");
        expect(typeof result.current.setVisibility).toBe("function");
    });

    it("should provide chat context with isNewChat when provided", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ isNewChat: true }),
        });

        expect(result.current.isNewChat).toBe(true);
    });

    it("should provide chat context with visibility when provided", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ visibility: CHAT_VISIBILITY.PRIVATE }),
        });

        expect(result.current.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
        expect(result.current.isPrivate).toBe(true);
        expect(result.current.isPublic).toBe(false);
    });

    it("should provide chat context with isPublic when visibility is public", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ visibility: CHAT_VISIBILITY.PUBLIC }),
        });

        expect(result.current.isPublic).toBe(true);
        expect(result.current.isPrivate).toBe(false);
    });

    it("should update isOwner when setIsOwner is called", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ isOwner: false }),
        });

        expect(result.current.isOwner).toBe(false);

        act(() => {
            result.current.setIsOwner(true);
        });

        expect(result.current.isOwner).toBe(true);
    });

    it("should update visibility when setVisibility is called", () => {
        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ visibility: CHAT_VISIBILITY.PRIVATE }),
        });

        expect(result.current.visibility).toBe(CHAT_VISIBILITY.PRIVATE);

        act(() => {
            result.current.setVisibility(CHAT_VISIBILITY.PUBLIC);
        });

        expect(result.current.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(result.current.isPublic).toBe(true);
    });

    it("should provide messages context with messages from useChat", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                content: "test",
            } as any,
        ];

        mockUseChat.mockReturnValue({
            chatId,
            messages,
            status: "ready",
            error: undefined,
            selectedFiles: [],
            uploadedFiles: [],
            isUploadingFiles: false,
            isStreaming: false,
            isSubmitted: false,
            isReady: true,
            isError: false,
            handleSendMessage: vi.fn(),
            handleStop: vi.fn(),
            handleAssistantRegenerate: vi.fn(),
            handleUserRegenerate: vi.fn(),
            handleFileSelect: vi.fn(),
            handleFileRemove: vi.fn(),
        } as any);

        const { result } = renderHook(() => useChatMessagesContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.messages).toEqual(messages);
    });

    it("should provide files context with file handlers", () => {
        const { result } = renderHook(() => useChatFilesContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual([]);
        expect(result.current.isUploadingFiles).toBe(false);
        expect(typeof result.current.handleFileSelect).toBe("function");
        expect(typeof result.current.handleFileRemove).toBe("function");
    });

    it("should provide status context with status flags", () => {
        const { result } = renderHook(() => useChatStatusContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.status).toBe("ready");
        expect(result.current.error).toBeUndefined();
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.isError).toBe(false);
    });

    it("should provide handlers context with handler functions", () => {
        const { result } = renderHook(() => useChatHandlersContext(), {
            wrapper: createWrapper(),
        });

        expect(typeof result.current.handleSendMessage).toBe("function");
        expect(typeof result.current.handleStop).toBe("function");
        expect(typeof result.current.handleAssistantRegenerate).toBe(
            "function",
        );
        expect(typeof result.current.handleUserRegenerate).toBe("function");
    });

    it("should provide messages rate limit context", () => {
        const { result } = renderHook(() => useChatMessagesRateLimitContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.rateLimit).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isPending).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it("should provide files rate limit context", () => {
        const { result } = renderHook(() => useChatFilesRateLimitContext(), {
            wrapper: createWrapper(),
        });

        expect(result.current.rateLimit).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isPending).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it("should refetch rate limits when chat finishes", () => {
        let capturedOnFinish: (() => void) | undefined;
        const mockRefetchMessages = vi.fn();
        const mockRefetchFiles = vi.fn();

        mockUseChat.mockImplementation((options: any) => {
            capturedOnFinish = options.onFinish;
            return {
                chatId,
                messages: initialMessages,
                status: "ready",
                error: undefined,
                selectedFiles: [],
                uploadedFiles: [],
                isUploadingFiles: false,
                isStreaming: false,
                isSubmitted: false,
                isReady: true,
                isError: false,
                handleSendMessage: vi.fn(),
                handleStop: vi.fn(),
                handleAssistantRegenerate: vi.fn(),
                handleUserRegenerate: vi.fn(),
                handleFileSelect: vi.fn(),
                handleFileRemove: vi.fn(),
            };
        });

        mockUseUserMessagesRateLimit.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
            isPending: false,
            refetch: mockRefetchMessages,
        } as any);

        mockUseUserFilesRateLimit.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
            isPending: false,
            refetch: mockRefetchFiles,
        } as any);

        renderHook(() => useChatContext(), {
            wrapper: createWrapper(),
        });

        act(() => {
            capturedOnFinish?.();
        });

        expect(mockRefetchMessages).toHaveBeenCalled();
        expect(mockRefetchFiles).toHaveBeenCalled();
    });

    it("should update owner and visibility when duplicated chat finishes", () => {
        let capturedOnDuplicatedChatFinished: (() => void) | undefined;

        mockUseChat.mockImplementation((options: any) => {
            capturedOnDuplicatedChatFinished = options.onDuplicatedChatFinished;
            return {
                chatId,
                messages: initialMessages,
                status: "ready",
                error: undefined,
                selectedFiles: [],
                uploadedFiles: [],
                isUploadingFiles: false,
                isStreaming: false,
                isSubmitted: false,
                isReady: true,
                isError: false,
                handleSendMessage: vi.fn(),
                handleStop: vi.fn(),
                handleAssistantRegenerate: vi.fn(),
                handleUserRegenerate: vi.fn(),
                handleFileSelect: vi.fn(),
                handleFileRemove: vi.fn(),
            };
        });

        const { result } = renderHook(() => useChatContext(), {
            wrapper: createWrapper({ isOwner: false }),
        });

        expect(result.current.isOwner).toBe(false);

        act(() => {
            capturedOnDuplicatedChatFinished?.();
        });

        expect(result.current.isOwner).toBe(true);
        expect(result.current.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

describe("useChatContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatContext());
        }).toThrow("useChatContext must be used within a ChatProvider.");
    });
});

describe("useChatMessagesContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatMessagesContext());
        }).toThrow(
            "useChatMessagesContext must be used within a ChatProvider.",
        );
    });
});

describe("useChatFilesContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatFilesContext());
        }).toThrow("useChatFilesContext must be used within a ChatProvider.");
    });
});

describe("useChatStatusContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatStatusContext());
        }).toThrow("useChatStatusContext must be used within a ChatProvider.");
    });
});

describe("useChatHandlersContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatHandlersContext());
        }).toThrow(
            "useChatHandlersContext must be used within a ChatProvider.",
        );
    });
});

describe("useChatMessagesRateLimitContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatMessagesRateLimitContext());
        }).toThrow(
            "useChatMessagesRateLimitContext must be used within a ChatProvider.",
        );
    });
});

describe("useChatFilesRateLimitContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatFilesRateLimitContext());
        }).toThrow(
            "useChatFilesRateLimitContext must be used within a ChatProvider.",
        );
    });
});

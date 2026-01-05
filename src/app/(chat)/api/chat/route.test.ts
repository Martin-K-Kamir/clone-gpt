import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import {
    CHAT_ROLE,
    CHAT_TRIGGER,
    CHAT_VISIBILITY,
} from "@/features/chat/lib/constants";

import { POST } from "./route";

const mocks = vi.hoisted(() => ({
    checkUserMessagesRateLimit: vi.fn(),
    checkUserFilesRateLimit: vi.fn(),
    uncachedGetUserChatById: vi.fn(),
    createUserChat: vi.fn(),
    duplicateUserChat: vi.fn(),
    uncachedGetUserChatMessages: vi.fn(),
    storeUserChatMessages: vi.fn(),
    storeUserChatMessage: vi.fn(),
    deleteUserChatMessagesStartingFrom: vi.fn(),
    updateUserChatMessage: vi.fn(),
    updateUserChat: vi.fn(),
    incrementUserMessagesRateLimit: vi.fn(),
    incrementUserFilesRateLimit: vi.fn(),
    generateChatTitle: vi.fn(),
    streamText: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/user/services/db", () => ({
    checkUserMessagesRateLimit: mocks.checkUserMessagesRateLimit,
    checkUserFilesRateLimit: mocks.checkUserFilesRateLimit,
    incrementUserMessagesRateLimit: mocks.incrementUserMessagesRateLimit,
    incrementUserFilesRateLimit: mocks.incrementUserFilesRateLimit,
}));

vi.mock("@/features/chat/services/db", () => ({
    uncachedGetUserChatById: mocks.uncachedGetUserChatById,
    createUserChat: mocks.createUserChat,
    duplicateUserChat: mocks.duplicateUserChat,
    uncachedGetUserChatMessages: mocks.uncachedGetUserChatMessages,
    storeUserChatMessages: mocks.storeUserChatMessages,
    storeUserChatMessage: mocks.storeUserChatMessage,
    deleteUserChatMessagesStartingFrom:
        mocks.deleteUserChatMessagesStartingFrom,
    updateUserChatMessage: mocks.updateUserChatMessage,
    updateUserChat: mocks.updateUserChat,
}));

vi.mock("@/features/chat/services/ai", () => ({
    generateChatTitle: mocks.generateChatTitle,
}));

vi.mock("ai", async () => {
    const actual = await vi.importActual("ai");
    return {
        ...actual,
        streamText: mocks.streamText,
    };
});

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                stream: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            rateLimit: {
                specific: vi.fn((data: any, _placeholders: any) => ({
                    success: false as const,
                    error: data,
                    toResponse: vi.fn(
                        () => new Response(JSON.stringify({ error: data })),
                    ),
                })),
            },
            chat: {
                create: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ error: "Create failed" }),
                            ),
                    ),
                })),
                unauthorized: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ error: "Unauthorized" }),
                            ),
                    ),
                })),
                duplicate: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ error: "Duplicate failed" }),
                            ),
                    ),
                })),
                stream: vi.fn((error: any) => ({
                    success: false as const,
                    error,
                    toResponse: vi.fn(
                        () => new Response(JSON.stringify({ error })),
                    ),
                })),
            },
        },
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiErrorResponse: vi.fn((error: any, handler: any) => handler(error)),
}));

describe("POST /api/chat", () => {
    const mockSession = createMockSessionWithUser();
    const userId = mockSession.user.id;
    const chatId = generateChatId();

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue(mockSession);

        mocks.checkUserMessagesRateLimit.mockResolvedValue({
            isOverLimit: false,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
        });

        mocks.checkUserFilesRateLimit.mockResolvedValue({
            isOverLimit: false,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
        });

        const mockStreamResult = {
            consumeStream: vi.fn(),
            toUIMessageStreamResponse: vi.fn(() => {
                return new Response("streaming response", {
                    headers: {
                        "Content-Type": "text/event-stream",
                    },
                });
            }),
        };

        mocks.streamText.mockReturnValue(mockStreamResult);
    });

    it("should return streaming response successfully for new chat", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        mocks.uncachedGetUserChatById.mockResolvedValue(null);
        mocks.generateChatTitle.mockResolvedValue("Test Chat");
        mocks.createUserChat.mockResolvedValue({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
        });
        mocks.uncachedGetUserChatMessages.mockResolvedValue({
            data: [],
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return streaming response successfully for existing chat", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        mocks.uncachedGetUserChatById.mockResolvedValue({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocks.uncachedGetUserChatMessages.mockResolvedValue({
            data: [],
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when messages rate limit is exceeded", async () => {
        mocks.checkUserMessagesRateLimit.mockResolvedValue({
            isOverLimit: true,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
            reason: "MESSAGES_LIMIT_EXCEEDED",
        });

        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when files rate limit is exceeded", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [
                {
                    type: "file",
                    url: "http://example.com/file.txt",
                    name: "file.txt",
                },
            ],
        };

        mocks.checkUserFilesRateLimit.mockResolvedValue({
            isOverLimit: true,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
            reason: "FILES_LIMIT_EXCEEDED",
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when chat creation fails", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        mocks.uncachedGetUserChatById.mockResolvedValue(null);
        mocks.generateChatTitle.mockResolvedValue("Test Chat");
        mocks.createUserChat.mockResolvedValue(null);

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when accessing private chat without ownership", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        mocks.uncachedGetUserChatById.mockResolvedValue({
            id: chatId,
            userId: generateUserId(),
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: false,
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should handle chat duplication for public chats", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        const newChatId = generateChatId();

        mocks.uncachedGetUserChatById.mockResolvedValue({
            id: chatId,
            userId: generateUserId(),
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PUBLIC,
            isOwner: false,
        });

        mocks.duplicateUserChat.mockResolvedValue({
            id: newChatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        mocks.uncachedGetUserChatMessages.mockResolvedValue({
            data: [],
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            newChatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when chat duplication fails", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        const newChatId = generateChatId();

        mocks.uncachedGetUserChatById.mockResolvedValue({
            id: chatId,
            userId: generateUserId(),
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PUBLIC,
            isOwner: false,
        });

        mocks.duplicateUserChat.mockResolvedValue(null);

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            newChatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when streamText fails", async () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            content: "Hello",
            parts: [],
        };

        mocks.uncachedGetUserChatById.mockResolvedValue({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });

        mocks.uncachedGetUserChatMessages.mockResolvedValue({
            data: [],
        });

        mocks.streamText.mockImplementation(() => {
            throw new Error("Stream error");
        });

        const body = {
            message,
            userChatPreferences: {},
            chatId,
            trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        };

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });
});

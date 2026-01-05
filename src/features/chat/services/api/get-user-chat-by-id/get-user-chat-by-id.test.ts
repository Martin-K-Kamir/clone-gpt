import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat, DBChatId, WithIsOwner } from "@/features/chat/lib/types";

import { getUserChatById } from "./get-user-chat-by-id";

describe("getUserChatById", () => {
    it("should return chat data when API returns success", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChat: DBChat & WithIsOwner = {
            id: chatId,
            userId,
            title: "Test Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibleAt: "2024-01-01T00:00:00Z",
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        };

        const mockResponse = {
            success: true,
            data: mockChat,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.id).toBe(chatId);
        expect(result.title).toBe("Test Chat");
        expect(result.isOwner).toBe(true);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should return chat data with public visibility", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChat: DBChat & WithIsOwner = {
            id: chatId,
            userId,
            title: "Public Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibility: CHAT_VISIBILITY.PUBLIC,
            visibleAt: "2024-01-01T00:00:00Z",
            isOwner: false,
        };

        const mockResponse = {
            success: true,
            data: mockChat,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(result.isOwner).toBe(false);
        expect(result.visibleAt).toBe("2024-01-01T00:00:00Z");
    });

    it("should throw error when chatId is not provided", async () => {
        await expect(
            getUserChatById({ chatId: undefined as any }),
        ).rejects.toThrow("Chat ID is required to fetch a chat");

        await expect(getUserChatById({ chatId: null as any })).rejects.toThrow(
            "Chat ID is required to fetch a chat",
        );

        await expect(getUserChatById({ chatId: "" as any })).rejects.toThrow(
            "Chat ID is required to fetch a chat",
        );
    });

    it("should throw error when API returns error response (not ok)", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(getUserChatById({ chatId })).rejects.toThrow(
            "Failed to fetch chat by ID",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(
                    { error: "Chat not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(getUserChatById({ chatId })).rejects.toThrow(
            "Failed to fetch chat by ID",
        );
    });

    it("should throw error when API response has success: false", async () => {
        const chatId = generateChatId();
        const mockErrorResponse = {
            success: false,
            message: "Chat not found",
            status: 404,
            timestamp: Date.now(),
        };

        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(getUserChatById({ chatId })).rejects.toThrow(
            "Chat not found",
        );
    });

    it("should throw error on network failure", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.error();
            }),
        );

        await expect(getUserChatById({ chatId })).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(getUserChatById({ chatId })).rejects.toThrow(
            "Failed to fetch chat by ID",
        );
    });

    it("should include chatId in the API request URL", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChat: DBChat & WithIsOwner = {
            id: chatId,
            userId,
            title: "Specific Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibleAt: "2024-01-01T00:00:00Z",
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        };

        const mockResponse = {
            success: true,
            data: mockChat,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(`http://localhost/api/user-chats/${chatId}`, () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.id).toBe(chatId);
    });
});

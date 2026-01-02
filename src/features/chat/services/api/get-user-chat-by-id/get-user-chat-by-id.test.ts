import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { DBChat, DBChatId, WithIsOwner } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChatById } from "./get-user-chat-by-id";

describe("getUserChatById", () => {
    it("should return chat data when API returns success", async () => {
        const mockChat: DBChat & WithIsOwner = {
            id: "chat-123" as DBChatId,
            userId: "user-123" as DBUserId,
            title: "Test Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibleAt: "2024-01-01T00:00:00Z",
            visibility: "private",
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
            http.get("http://localhost/api/user-chats/chat-123", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId: "chat-123" as DBChatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.id).toBe("chat-123");
        expect(result.title).toBe("Test Chat");
        expect(result.isOwner).toBe(true);
        expect(result.visibility).toBe("private");
    });

    it("should return chat data with public visibility", async () => {
        const mockChat: DBChat & WithIsOwner = {
            id: "chat-456" as DBChatId,
            userId: "user-456" as DBUserId,
            title: "Public Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibility: "public",
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
            http.get("http://localhost/api/user-chats/chat-456", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId: "chat-456" as DBChatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.visibility).toBe("public");
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
        server.use(
            http.get("http://localhost/api/user-chats/chat-123", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(
            getUserChatById({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat by ID");
    });

    it("should throw error when API returns 404 not found", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/chat-999", () => {
                return HttpResponse.json(
                    { error: "Chat not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(
            getUserChatById({ chatId: "chat-999" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat by ID");
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Chat not found",
            status: 404,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats/chat-123", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(
            getUserChatById({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Chat not found");
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/chat-123", () => {
                return HttpResponse.error();
            }),
        );

        await expect(
            getUserChatById({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/chat-123", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(
            getUserChatById({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat by ID");
    });

    it("should include chatId in the API request URL", async () => {
        const mockChat: DBChat & WithIsOwner = {
            id: "specific-chat-id" as DBChatId,
            userId: "user-123" as DBUserId,
            title: "Specific Chat",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
            visibleAt: "2024-01-01T00:00:00Z",
            visibility: "private",
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
            http.get("http://localhost/api/user-chats/specific-chat-id", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatById({
            chatId: "specific-chat-id" as DBChatId,
        });

        expect(result).toEqual(mockChat);
        expect(result.id).toBe("specific-chat-id");
    });
});

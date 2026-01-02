import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { DBChatId, DBChatVisibility } from "@/features/chat/lib/types";

import { getUserChatVisibility } from "./get-user-chat-visibility";

describe("getUserChatVisibility", () => {
    it("should return private visibility when API returns success", async () => {
        const mockVisibility: DBChatVisibility = "private";

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-123",
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId: "chat-123" as DBChatId,
        });

        expect(result).toBe("private");
    });

    it("should return public visibility when API returns success", async () => {
        const mockVisibility: DBChatVisibility = "public";

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-456",
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId: "chat-456" as DBChatId,
        });

        expect(result).toBe("public");
    });

    it("should throw error when API returns error response (not ok)", async () => {
        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-123",
                () => {
                    return HttpResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 },
                    );
                },
            ),
        );

        await expect(
            getUserChatVisibility({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat visibility");
    });

    it("should throw error when API returns 404 not found", async () => {
        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-999",
                () => {
                    return HttpResponse.json(
                        { error: "Chat not found" },
                        { status: 404 },
                    );
                },
            ),
        );

        await expect(
            getUserChatVisibility({ chatId: "chat-999" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat visibility");
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Chat not found",
            status: 404,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-123",
                () => {
                    return HttpResponse.json(mockErrorResponse, {
                        status: 200,
                    });
                },
            ),
        );

        await expect(
            getUserChatVisibility({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Chat not found");
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-123",
                () => {
                    return HttpResponse.error();
                },
            ),
        );

        await expect(
            getUserChatVisibility({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/chat-123",
                () => {
                    return HttpResponse.json(
                        { error: "Internal server error" },
                        { status: 500 },
                    );
                },
            ),
        );

        await expect(
            getUserChatVisibility({ chatId: "chat-123" as DBChatId }),
        ).rejects.toThrow("Failed to fetch chat visibility");
    });

    it("should include chatId in the API request URL", async () => {
        const mockVisibility: DBChatVisibility = "private";

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/visibility/specific-chat-id",
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId: "specific-chat-id" as DBChatId,
        });

        expect(result).toBe("private");
    });
});

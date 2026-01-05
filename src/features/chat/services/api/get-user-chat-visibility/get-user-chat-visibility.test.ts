import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { getUserChatVisibility } from "./get-user-chat-visibility";

describe("getUserChatVisibility", () => {
    it("should return private visibility when API returns success", async () => {
        const chatId = generateChatId();
        const mockVisibility = CHAT_VISIBILITY.PRIVATE;

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId,
        });

        expect(result).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should return public visibility when API returns success", async () => {
        const chatId = generateChatId();
        const mockVisibility = CHAT_VISIBILITY.PUBLIC;

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId,
        });

        expect(result).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should throw error when API returns error response (not ok)", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 },
                    );
                },
            ),
        );

        await expect(getUserChatVisibility({ chatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(
                        { error: "Chat not found" },
                        { status: 404 },
                    );
                },
            ),
        );

        await expect(getUserChatVisibility({ chatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
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
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(mockErrorResponse, {
                        status: 200,
                    });
                },
            ),
        );

        await expect(getUserChatVisibility({ chatId })).rejects.toThrow(
            "Chat not found",
        );
    });

    it("should throw error on network failure", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.error();
                },
            ),
        );

        await expect(getUserChatVisibility({ chatId })).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        const chatId = generateChatId();
        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(
                        { error: "Internal server error" },
                        { status: 500 },
                    );
                },
            ),
        );

        await expect(getUserChatVisibility({ chatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
        );
    });

    it("should include chatId in the API request URL", async () => {
        const chatId = generateChatId();
        const mockVisibility = CHAT_VISIBILITY.PRIVATE;

        const mockResponse = {
            success: true,
            data: mockVisibility,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                `http://localhost/api/user-chats/visibility/${chatId}`,
                () => {
                    return HttpResponse.json(mockResponse);
                },
            ),
        );

        const result = await getUserChatVisibility({
            chatId,
        });

        expect(result).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

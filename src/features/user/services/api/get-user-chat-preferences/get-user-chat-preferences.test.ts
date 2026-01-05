import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants/ai";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

import { ApiError } from "@/lib/classes";

import { getUserChatPreferences } from "./get-user-chat-preferences";

describe("getUserChatPreferences", () => {
    it("should return user chat preferences when API returns success", async () => {
        const userId = generateUserId();
        const mockPreferences: DBUserChatPreferences = {
            id: "pref-123",
            userId,
            personality: AI_PERSONALITIES.FRIENDLY.id,
            nickname: "Assistant",
            role: "helper",
            characteristics: "Helpful and friendly",
            extraInfo: "Some extra information",
            createdAt: "2024-01-01T00:00:00Z",
        };

        const mockResponse = {
            success: true,
            data: mockPreferences,
            message: "User chat preferences retrieved successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatPreferences();

        expect(result).toEqual(mockPreferences);
        expect(result.userId).toBe(userId);
        expect(result.personality).toBe(AI_PERSONALITIES.FRIENDLY.id);
        expect(result.nickname).toBe("Assistant");
    });

    it("should return user chat preferences with null optional fields", async () => {
        const userId = generateUserId();
        const mockPreferences: DBUserChatPreferences = {
            id: "pref-456",
            userId,
            personality: AI_PERSONALITIES.PROFESSIONAL.id,
            nickname: null,
            role: null,
            characteristics: null,
            extraInfo: null,
            createdAt: "2024-01-01T00:00:00Z",
        };

        const mockResponse = {
            success: true,
            data: mockPreferences,
            message: "User chat preferences retrieved successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChatPreferences();

        expect(result).toEqual(mockPreferences);
        expect(result.nickname).toBeNull();
        expect(result.role).toBeNull();
        expect(result.characteristics).toBeNull();
        expect(result.extraInfo).toBeNull();
        expect(result.personality).toBe(AI_PERSONALITIES.PROFESSIONAL.id);
    });

    it("should return user chat preferences with different personality types", async () => {
        const userId = generateUserId();
        const personalities = [
            AI_PERSONALITIES.FRIENDLY.id,
            AI_PERSONALITIES.CYNICAL.id,
            AI_PERSONALITIES.ROBOT.id,
            AI_PERSONALITIES.LISTENER.id,
            AI_PERSONALITIES.NERD.id,
            AI_PERSONALITIES.YODA.id,
            AI_PERSONALITIES.PROFESSIONAL.id,
            AI_PERSONALITIES.SILLY.id,
        ] as const;

        for (const personality of personalities) {
            const mockPreferences: DBUserChatPreferences = {
                id: "pref-test",
                userId,
                personality,
                nickname: null,
                role: null,
                characteristics: null,
                extraInfo: null,
                createdAt: "2024-01-01T00:00:00Z",
            };

            const mockResponse = {
                success: true,
                data: mockPreferences,
                message: "User chat preferences retrieved successfully",
                status: 200,
                timestamp: Date.now(),
            };

            server.use(
                http.get("http://localhost/api/user/chat-preferences", () => {
                    return HttpResponse.json(mockResponse);
                }),
            );

            const result = await getUserChatPreferences();

            expect(result.personality).toBe(personality);
        }
    });

    it("should throw ApiError when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(getUserChatPreferences()).rejects.toThrow(ApiError);
        await expect(getUserChatPreferences()).rejects.toThrow(
            "Failed to fetch user chat preferences",
        );
    });

    it("should throw ApiError with correct status code when API returns error", async () => {
        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }),
        );

        try {
            await getUserChatPreferences();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(403);
            }
        }
    });

    it("should throw ApiError when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "User chat preferences not found",
            status: 404,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(getUserChatPreferences()).rejects.toThrow(ApiError);
        await expect(getUserChatPreferences()).rejects.toThrow(
            "User chat preferences not found",
        );

        try {
            await getUserChatPreferences();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(404);
            }
        }
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getUserChatPreferences()).rejects.toThrow();
    });

    it("should throw ApiError when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user/chat-preferences", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(getUserChatPreferences()).rejects.toThrow(ApiError);
        await expect(getUserChatPreferences()).rejects.toThrow(
            "Failed to fetch user chat preferences",
        );

        try {
            await getUserChatPreferences();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(500);
            }
        }
    });
});

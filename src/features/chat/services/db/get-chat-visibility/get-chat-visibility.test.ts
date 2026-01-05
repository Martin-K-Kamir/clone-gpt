import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import { getChatVisibility } from "./get-chat-visibility";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getChatVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            getChatVisibility({ chatId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should return visibility and userId on success", async () => {
        const mockData = {
            visibility: CHAT_VISIBILITY.PUBLIC,
            userId: "00000000-0000-0000-0000-000000000001",
        };

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockData,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(result?.userId).toBe(mockData.userId);
    });

    it("should return private visibility", async () => {
        const mockData = {
            visibility: CHAT_VISIBILITY.PRIVATE,
            userId: "00000000-0000-0000-0000-000000000001",
        };

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockData,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should throw when fetch fails", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        });

        await expect(getChatVisibility({ chatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
        );
    });

    it("should throw when chat does not exist", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: { code: "PGRST116", message: "not found" },
                    }),
                }),
            }),
        });

        await expect(getChatVisibility({ chatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
        );
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

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

    it("throws when chatId is invalid", async () => {
        await expect(
            getChatVisibility({ chatId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("returns visibility and userId on success", async () => {
        const mockData = {
            visibility: "public",
            userId: "00000000-0000-0000-0000-000000000abc",
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
        expect(result?.visibility).toBe("public");
        expect(result?.userId).toBe(mockData.userId);
    });

    it("returns private visibility", async () => {
        const mockData = {
            visibility: "private",
            userId: "00000000-0000-0000-0000-000000000abc",
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
        expect(result?.visibility).toBe("private");
    });

    it("throws on supabase error", async () => {
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

    it("throws when chat not found (PGRST116)", async () => {
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

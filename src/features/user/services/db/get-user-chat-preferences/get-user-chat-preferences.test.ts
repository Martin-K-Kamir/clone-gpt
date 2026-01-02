import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChatPreferences } from "./get-user-chat-preferences";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserChatPreferences", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            getUserChatPreferences({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("returns preferences on success", async () => {
        const mockPrefs = {
            userId,
            personality: "FRIENDLY",
            nickname: "Alpha",
        };

        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: mockPrefs,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getUserChatPreferences({ userId });

        expect(result).toEqual(mockPrefs);
    });

    it("returns null when not found", async () => {
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { code: "PGRST116" },
                    }),
                }),
            }),
        });

        const result = await getUserChatPreferences({ userId });

        expect(result).toBeNull();
    });
});

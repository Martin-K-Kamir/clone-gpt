import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants/ai";

import { getUserChatPreferences } from "./get-user-chat-preferences";

const userId = generateUserId();

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

    it("should throw for invalid userId", async () => {
        await expect(
            getUserChatPreferences({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should return preferences on success", async () => {
        const mockPrefs = {
            userId,
            personality: AI_PERSONALITIES.FRIENDLY.id,
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

    it("should return null when not found", async () => {
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

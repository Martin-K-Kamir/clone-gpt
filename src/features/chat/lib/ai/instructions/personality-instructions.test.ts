import { describe, expect, expectTypeOf, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

import { personalityInstructions } from "./personality-instructions";

describe("personalityInstructions", () => {
    it("should return a string", () => {
        const result = personalityInstructions(null);

        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when userChatPreferences is null", () => {
        const result = personalityInstructions(null);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return a string when userChatPreferences has personality", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const result = personalityInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return a string for different personalities", () => {
        const personalities = Object.values(AI_PERSONALITIES);

        personalities.forEach(personality => {
            const preferences: DBUserChatPreferences = {
                personality: personality.id,
            } as DBUserChatPreferences;

            const result = personalityInstructions(preferences);

            expectTypeOf(result).toEqualTypeOf<string>();
            expect(typeof result).toBe("string");
        });
    });

    it("should return a string when personality is invalid", () => {
        const preferences = {
            personality: "INVALID_PERSONALITY",
        } as unknown as DBUserChatPreferences;

        const result = personalityInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });
});

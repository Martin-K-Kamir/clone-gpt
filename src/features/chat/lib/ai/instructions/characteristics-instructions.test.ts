import { describe, expect, expectTypeOf, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

import { characteristicsInstructions } from "./characteristics-instructions";

describe("characteristicsInstructions", () => {
    it("should return a string", () => {
        const result = characteristicsInstructions(null);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return empty string when userChatPreferences is null", () => {
        const result = characteristicsInstructions(null);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result).toBe("");
    });

    it("should return empty string when characteristics is missing", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const result = characteristicsInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result).toBe("");
    });

    it("should return a string when characteristics is provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            characteristics: "GEN_Z,CHATTERBOX",
        } as DBUserChatPreferences;

        const result = characteristicsInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string for single characteristic", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            characteristics: "DIRECT",
        } as DBUserChatPreferences;

        const result = characteristicsInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return a string for multiple characteristics", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            characteristics: "GEN_Z,CHATTERBOX,QUICK_WIT,MOTIVATOR",
        } as DBUserChatPreferences;

        const result = characteristicsInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });
});

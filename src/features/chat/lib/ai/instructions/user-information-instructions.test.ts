import { describe, expect, expectTypeOf, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

import { userInformationInstructions } from "./user-information-instructions";

describe("userInformationInstructions", () => {
    it("should return a string", () => {
        const result = userInformationInstructions(null);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return empty string when userChatPreferences is null", () => {
        const result = userInformationInstructions(null);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result).toBe("");
    });

    it("should return empty string when all fields are missing", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const result = userInformationInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result).toBe("");
    });

    it("should return a string when nickname is provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            nickname: "John",
        } as DBUserChatPreferences;

        const result = userInformationInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when role is provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            role: "Software Engineer",
        } as DBUserChatPreferences;

        const result = userInformationInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when extraInfo is provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            extraInfo: "Some additional information",
        } as DBUserChatPreferences;

        const result = userInformationInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when all fields are provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            nickname: "John",
            role: "Software Engineer",
            extraInfo: "Additional info",
        } as DBUserChatPreferences;

        const result = userInformationInstructions(preferences);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});

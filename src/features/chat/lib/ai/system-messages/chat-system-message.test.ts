import type { Geo } from "@vercel/functions";
import { describe, expect, expectTypeOf, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

import { chatSystemMessage } from "./chat-system-message";

describe("chatSystemMessage", () => {
    it("should return a string", () => {
        const geo: Geo = {};
        const result = chatSystemMessage(null, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when userChatPreferences is null", () => {
        const geo: Geo = {
            city: "Prague",
        };

        const result = chatSystemMessage(null, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when userChatPreferences is provided", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const geo: Geo = {};

        const result = chatSystemMessage(preferences, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string with full userChatPreferences", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
            nickname: "John",
            role: "Software Engineer",
            extraInfo: "Additional info",
            characteristics: "GEN_Z,CHATTERBOX",
        } as DBUserChatPreferences;

        const geo: Geo = {
            city: "Prague",
            country: "Czech Republic",
        };

        const result = chatSystemMessage(preferences, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string with different personalities", () => {
        const personalities = Object.values(AI_PERSONALITIES);
        const geo: Geo = {};

        personalities.forEach(personality => {
            const preferences: DBUserChatPreferences = {
                personality: personality.id,
            } as DBUserChatPreferences;

            const result = chatSystemMessage(preferences, geo);

            expectTypeOf(result).toEqualTypeOf<string>();
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
        });
    });

    it("should return a string with empty geo", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const geo: Geo = {};

        const result = chatSystemMessage(preferences, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string with full geo data", () => {
        const preferences: DBUserChatPreferences = {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as DBUserChatPreferences;

        const geo: Geo = {
            city: "Prague",
            country: "Czech Republic",
            countryRegion: "Prague",
            latitude: "50.0755",
            longitude: "14.4378",
            region: "Central Europe",
        };

        const result = chatSystemMessage(preferences, geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});

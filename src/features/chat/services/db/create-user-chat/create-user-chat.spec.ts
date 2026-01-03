import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { createUserChat } from "./create-user-chat";

describe("createUserChat", () => {
    it("creates a new chat", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        const chat = await createUserChat({
            chatId,
            userId,
            title: "Test Chat",
        });

        expect(chat).not.toBeNull();
        expect(chat?.id).toBe(chatId);
        expect(chat?.userId).toBe(userId);
        expect(chat?.title).toBe("Test Chat");
        expect(chat?.visibility).toBe("private");
    });

    it("creates a chat with default private visibility", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        const chat = await createUserChat({
            chatId,
            userId,
            title: "Public Test Chat",
        });

        expect(chat).not.toBeNull();
        expect(chat?.id).toBe(chatId);
        expect(chat?.userId).toBe(userId);
        expect(chat?.title).toBe("Public Test Chat");
        expect(chat?.visibility).toBe("private");
    });
});

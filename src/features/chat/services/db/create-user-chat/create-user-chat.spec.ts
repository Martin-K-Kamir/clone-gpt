import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { createUserChat } from "./create-user-chat";

describe("createUserChat", () => {
    it("should create a new chat", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
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
        expect(chat?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should create a chat with default private visibility", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
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
        expect(chat?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

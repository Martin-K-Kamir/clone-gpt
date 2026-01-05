import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { updateUserChat } from "./update-user-chat";

describe("updateUserChat", () => {
    it("should update chat title", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Original Title",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const newTitle = "Updated Title";
        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: newTitle },
        });

        expect(result.title).toBe(newTitle);
    });

    it("should update chat visibility", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateUserChat({
            chatId,
            userId,
            data: { visibility: CHAT_VISIBILITY.PUBLIC },
        });

        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should update both title and visibility", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Original Title",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const newTitle = "Updated Title and Visibility";
        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: newTitle, visibility: CHAT_VISIBILITY.PRIVATE },
        });

        expect(result.title).toBe(newTitle);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

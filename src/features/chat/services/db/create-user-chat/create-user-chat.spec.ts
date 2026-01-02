import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { createUserChat } from "./create-user-chat";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const seededChatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("createUserChat", () => {
    beforeEach(async () => {
        await supabase.from("messages").delete().eq("chatId", seededChatId);
        await supabase.from("chats").delete().eq("id", seededChatId);
    });

    it("creates a chat", async () => {
        const chatId = "30000000-0000-0000-0000-000000000999" as DBChatId;
        await supabase.from("chats").delete().eq("id", chatId);

        const chat = await createUserChat({
            chatId,
            userId,
            title: "Integration Test Chat",
        });

        expect(chat).not.toBeNull();
        expect(chat?.id).toBe(chatId);
        expect(chat?.userId).toBe(userId);
        expect(chat?.title).toBe("Integration Test Chat");

        await supabase.from("chats").delete().eq("id", chatId);
    });
});

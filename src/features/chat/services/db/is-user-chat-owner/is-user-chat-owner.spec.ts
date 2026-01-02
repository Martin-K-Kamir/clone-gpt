import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { isUserChatOwner } from "./is-user-chat-owner";

const userId1 = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const otherUserChatId = "30000000-0000-0000-0000-000000000003" as DBChatId;
const testChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("isUserChatOwner", () => {
    beforeEach(async () => {
        await supabase.from("messages").delete().eq("chatId", testChatId);
        await supabase.from("chats").delete().eq("id", testChatId);

        await supabase.from("chats").upsert({
            id: chatId,
            userId: userId1,
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        await supabase.from("chats").upsert({
            id: otherUserChatId,
            userId: "00000000-0000-0000-0000-000000000002",
            title: "Seed User2 Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    });
    it("returns true when user is owner", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: userId1,
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await isUserChatOwner({ chatId, userId: userId1 });

        expect(result).toBe(true);
    });

    it("throws when user is not owner", async () => {
        await expect(
            isUserChatOwner({ chatId: otherUserChatId, userId: userId1 }),
        ).rejects.toThrow("Failed to check chat ownership");
    });

    it("throws when chat does not exist", async () => {
        await supabase.from("chats").delete().eq("id", testChatId);

        await expect(
            isUserChatOwner({ chatId: testChatId, userId: userId1 }),
        ).rejects.toThrow("Failed to check chat ownership");
    });
});

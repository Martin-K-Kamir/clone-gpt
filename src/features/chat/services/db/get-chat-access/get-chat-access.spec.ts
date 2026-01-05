import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { getChatAccess } from "./get-chat-access";

const userId1 = "00000000-0000-0000-0000-000000000001" as DBUserId;
const userId2 = "00000000-0000-0000-0000-000000000002" as DBUserId;
const privateChatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const otherUserPrivateChatId =
    "30000000-0000-0000-0000-000000000003" as DBChatId;
const missingChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getChatAccess", () => {
    it("should return access allowed when user is owner of private chat", async () => {
        const result = await getChatAccess({
            chatId: privateChatId,
            userId: userId1,
        });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(true);
        expect(result.isPrivate).toBe(true);
        expect(result.isPublic).toBe(false);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should return access allowed when user is owner of public chat", async () => {
        const result = await getChatAccess({
            chatId: publicChatId,
            userId: userId1,
        });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(true);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(true);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should return access denied when user is not owner of private chat", async () => {
        const result = await getChatAccess({
            chatId: otherUserPrivateChatId,
            userId: userId1,
        });

        expect(result.allowed).toBe(false);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(true);
        expect(result.isPublic).toBe(false);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("should return access allowed when user is not owner of public chat", async () => {
        const result = await getChatAccess({
            chatId: publicChatId,
            userId: userId2,
        });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(true);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should return access denied when chat not found", async () => {
        const result = await getChatAccess({
            chatId: missingChatId,
            userId: userId1,
        });

        expect(result.allowed).toBe(false);
        expect(result.chatFound).toBe(false);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(false);
        expect(result).not.toHaveProperty("visibility");
    });

    it("should correctly identify owner status", async () => {
        const ownerResult = await getChatAccess({
            chatId: privateChatId,
            userId: userId1,
        });
        expect(ownerResult.isOwner).toBe(true);

        const nonOwnerResult = await getChatAccess({
            chatId: privateChatId,
            userId: userId2,
        });
        expect(nonOwnerResult.isOwner).toBe(false);
    });
});

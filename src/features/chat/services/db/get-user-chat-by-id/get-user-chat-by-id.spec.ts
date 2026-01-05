import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { uncachedGetUserChatById } from "./get-user-chat-by-id";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;
const privateChatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const missingChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getUserChatById", () => {
    it("should return seeded chat for user's own chat", async () => {
        const result = await uncachedGetUserChatById({
            chatId: privateChatId,
            userId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(privateChatId);
        expect(result?.userId).toBe(userId);
        if (result) {
            expect(result.isOwner).toBe(true);
        }
    });

    it("should return chat with correct isOwner when user does not own chat", async () => {
        const result = await uncachedGetUserChatById({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(publicChatId);
        if (result) {
            expect(result.isOwner).toBe(false);
        }
    });

    it("should return chat when verifyChatAccess is false", async () => {
        const result = await uncachedGetUserChatById({
            chatId: privateChatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(privateChatId);
    });

    it("should throw when user does not have access to private chat", async () => {
        const user2PrivateChatId =
            "30000000-0000-0000-0000-000000000003" as DBChatId;

        await expect(
            uncachedGetUserChatById({
                chatId: user2PrivateChatId,
                userId,
            }),
        ).rejects.toThrow("The chat is not accessible");
    });

    it("should allow access to public chat for non-owner", async () => {
        const result = await uncachedGetUserChatById({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        if (result) {
            expect(result.isOwner).toBe(false);
        }
    });

    it("should throw when chat not found and throwOnNotFound is true", async () => {
        await expect(
            uncachedGetUserChatById({
                chatId: missingChatId,
                userId,
                verifyChatAccess: false,
                throwOnNotFound: true,
            }),
        ).rejects.toThrow("Chat not found");
    });

    it("should return null when chat not found and throwOnNotFound is false", async () => {
        const result = await uncachedGetUserChatById({
            chatId: missingChatId,
            userId,
            verifyChatAccess: false,
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
    });
});

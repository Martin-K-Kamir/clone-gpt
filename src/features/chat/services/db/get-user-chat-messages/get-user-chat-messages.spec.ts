import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChatMessages } from "./get-user-chat-messages";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

describe("getUserChatMessages", () => {
    it("should return seeded messages for user's own chat", async () => {
        const result = await getUserChatMessages({ chatId, userId });

        expect(result).not.toBeNull();
        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(message => {
            expect(message).toHaveProperty("id");
            expect(message).toHaveProperty("role");
            expect(message).toHaveProperty("content");
        });
    });

    it("should return messages for public chat accessible by other user", async () => {
        const result = await getUserChatMessages({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result).not.toBeNull();
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(result.isOwner).toBe(false);
    });

    it("should throw for non-existent chat", async () => {
        const missingChatId =
            "30000000-0000-0000-0000-000000000999" as DBChatId;

        await expect(
            getUserChatMessages({
                chatId: missingChatId,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("should return empty array when verifyChatAccess is false and chat doesn't exist", async () => {
        const missingChatId =
            "30000000-0000-0000-0000-000000000999" as DBChatId;

        const result = await getUserChatMessages({
            chatId: missingChatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result.data).toEqual([]);
    });
});

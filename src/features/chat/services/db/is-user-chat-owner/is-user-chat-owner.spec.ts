import { describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { isUserChatOwner } from "./is-user-chat-owner";

const userId1 = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const otherUserChatId = "30000000-0000-0000-0000-000000000003" as DBChatId;
const missingChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("isUserChatOwner", () => {
    it("should return true when user is owner", async () => {
        const result = await isUserChatOwner({ chatId, userId: userId1 });

        expect(result).toBe(true);
    });

    it("should throw when user is not owner", async () => {
        await expect(
            isUserChatOwner({ chatId: otherUserChatId, userId: userId1 }),
        ).rejects.toThrow("Failed to check chat ownership");
    });

    it("should throw when chat does not exist", async () => {
        await expect(
            isUserChatOwner({ chatId: missingChatId, userId: userId1 }),
        ).rejects.toThrow("Failed to check chat ownership");
    });
});

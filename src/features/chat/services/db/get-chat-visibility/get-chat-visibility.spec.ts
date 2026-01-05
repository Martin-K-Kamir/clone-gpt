import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import { getChatVisibility } from "./get-chat-visibility";

const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const missingChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getChatVisibility", () => {
    it("should return visibility for private chat", async () => {
        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
        expect(result?.userId).toBeDefined();
    });

    it("should return visibility for public chat", async () => {
        const result = await getChatVisibility({ chatId: publicChatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(result?.userId).toBeDefined();
    });

    it("should return correct userId for chat", async () => {
        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.userId).toBe("00000000-0000-0000-0000-000000000001");
    });

    it("should throw when chat not found", async () => {
        await expect(
            getChatVisibility({ chatId: missingChatId }),
        ).rejects.toThrow("Failed to fetch chat visibility");
    });
});

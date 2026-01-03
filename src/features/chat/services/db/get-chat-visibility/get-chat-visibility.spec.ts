import { describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import { getChatVisibility } from "./get-chat-visibility";

const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const missingChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getChatVisibility", () => {
    it("returns visibility for private chat", async () => {
        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe("private");
        expect(result?.userId).toBeDefined();
    });

    it("returns visibility for public chat", async () => {
        const result = await getChatVisibility({ chatId: publicChatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe("public");
        expect(result?.userId).toBeDefined();
    });

    it("returns correct userId for chat", async () => {
        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.userId).toBe("00000000-0000-0000-0000-000000000001");
    });

    it("throws when chat not found", async () => {
        await expect(
            getChatVisibility({ chatId: missingChatId }),
        ).rejects.toThrow("Failed to fetch chat visibility");
    });
});

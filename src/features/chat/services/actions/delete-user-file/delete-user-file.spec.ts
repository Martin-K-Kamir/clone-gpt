import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteUserFile } from "./delete-user-file";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("deleteUserFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });
    });

    it("returns success when file is deleted", async () => {
        const storedFile = {
            fileId: "550e8400-e29b-41d4-a716-446655440000",
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };

        const result = await deleteUserFile({
            storedFile,
            chatId,
        });

        expect(result.success).toBe(true);
    });
});

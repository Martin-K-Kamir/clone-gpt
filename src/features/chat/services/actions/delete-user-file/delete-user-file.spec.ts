import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteUserFile } from "./delete-user-file";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

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

    it("deletes file successfully", async () => {
        const chatId = generateChatId();

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

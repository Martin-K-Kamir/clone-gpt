import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import { uploadUserFiles } from "./upload-user-files";

const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000001";

const mocks = vi.hoisted(() => ({
    storeUserFile: vi.fn(),
    getFileImageDimensions: vi.fn(),
}));

const apiSuccess = { success: true as const };
const apiError = { success: false as const };

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock(
    "@/features/chat/services/storage/store-user-file/store-user-file",
    () => ({
        storeUserFile: mocks.storeUserFile,
    }),
);

vi.mock(
    "@/lib/utils/get-file-image-dimensions/get-file-image-dimensions",
    () => ({
        getFileImageDimensions: mocks.getFileImageDimensions,
    }),
);

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            file: {
                uploadMany: vi.fn((data, _placeholders) => ({
                    ...apiSuccess,
                    data,
                })),
            },
        },
        error: Object.assign(
            vi.fn(_options => apiError),
            {
                file: {
                    uploadMany: vi.fn((_error, _placeholders) => apiError),
                },
            },
        ),
    },
}));

describe("uploadUserFiles", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user",
            },
        });
    });

    it("uploads files and returns success response", async () => {
        const file1 = new File(["content1"], "file1.pdf", {
            type: "application/pdf",
        });
        const file2 = new File(["content2"], "file2.pdf", {
            type: "application/pdf",
        });

        mocks.storeUserFile
            .mockResolvedValueOnce({
                fileId: "file-id-1",
                name: "file1.pdf",
                fileUrl: "https://example.com/file1.pdf",
                mediaType: "application/pdf",
            })
            .mockResolvedValueOnce({
                fileId: "file-id-2",
                name: "file2.pdf",
                fileUrl: "https://example.com/file2.pdf",
                mediaType: "application/pdf",
            });

        const result = await uploadUserFiles({
            files: [file1, file2],
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toMatchObject({
                fileId: "file-id-1",
                name: "file1.pdf",
                fileUrl: "https://example.com/file1.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: file1.size,
                kind: CHAT_MESSAGE_TYPE.FILE,
            });
            expect(result.data[1]).toMatchObject({
                fileId: "file-id-2",
                name: "file2.pdf",
                fileUrl: "https://example.com/file2.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: file2.size,
                kind: CHAT_MESSAGE_TYPE.FILE,
            });
        }
    });

    it("handles image files and includes dimensions", async () => {
        const imageFile = new File(["image content"], "image.png", {
            type: "image/png",
        });

        mocks.storeUserFile.mockResolvedValue({
            fileId: "image-id",
            name: "image.png",
            fileUrl: "https://example.com/image.png",
            mediaType: "image/png",
        });

        mocks.getFileImageDimensions.mockResolvedValue({
            width: 100,
            height: 200,
        });

        const result = await uploadUserFiles({
            files: [imageFile],
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]).toMatchObject({
                fileId: "image-id",
                name: "image.png",
                mediaType: "image/png",
                extension: "png",
                size: imageFile.size,
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                width: 100,
                height: 200,
            });
        }
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const file = new File(["content"], "file.pdf", {
            type: "application/pdf",
        });

        const result = await uploadUserFiles({
            files: [file],
            chatId,
        });

        expect(result.success).toBe(false);
    });

    it("handles storage errors", async () => {
        const file = new File(["content"], "file.pdf", {
            type: "application/pdf",
        });

        mocks.storeUserFile.mockRejectedValue(new Error("Storage error"));

        const result = await uploadUserFiles({
            files: [file],
            chatId,
        });

        expect(result.success).toBe(false);
    });

    it("handles multiple files with different types", async () => {
        const imageFile = new File(["image"], "image.jpg", {
            type: "image/jpeg",
        });
        const pdfFile = new File(["pdf"], "doc.pdf", {
            type: "application/pdf",
        });

        mocks.storeUserFile
            .mockResolvedValueOnce({
                fileId: "img-id",
                name: "image.jpg",
                fileUrl: "https://example.com/image.jpg",
                mediaType: "image/jpeg",
            })
            .mockResolvedValueOnce({
                fileId: "pdf-id",
                name: "doc.pdf",
                fileUrl: "https://example.com/doc.pdf",
                mediaType: "application/pdf",
            });

        mocks.getFileImageDimensions.mockResolvedValue({
            width: 50,
            height: 50,
        });

        const result = await uploadUserFiles({
            files: [imageFile, pdfFile],
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(2);
            expect(result.data[0].kind).toBe(CHAT_MESSAGE_TYPE.IMAGE);
            expect(result.data[1].kind).toBe(CHAT_MESSAGE_TYPE.FILE);
        }
    });
});

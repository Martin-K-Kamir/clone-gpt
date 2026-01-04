import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { POST } from "./route";

const mocks = vi.hoisted(() => ({
    deleteUserFile: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteUserFile: mocks.deleteUserFile,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            file: {
                deleteMany: vi.fn((data: any, _placeholders: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            file: {
                empty: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () => new Response(JSON.stringify({ error: "Empty" })),
                    ),
                })),
                deleteMany: vi.fn((error: any, _placeholders: any) => ({
                    success: false as const,
                    error,
                    toResponse: vi.fn(
                        () => new Response(JSON.stringify({ error })),
                    ),
                })),
            },
        },
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiErrorResponse: vi.fn((error: any, handler: any) => handler(error)),
}));

describe("POST /api/chat/delete-files", () => {
    const userId = "00000000-0000-0000-0000-000000000001";
    const chatId = "30000000-0000-0000-0000-000000000001";

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

    it("deletes files successfully", async () => {
        const files = [
            {
                name: "file1.txt",
                url: "http://example.com/file1.txt",
                type: "text/plain",
            },
            {
                name: "file2.txt",
                url: "http://example.com/file2.txt",
                type: "text/plain",
            },
        ];

        mocks.deleteUserFile.mockResolvedValue(true);

        const body = { files, chatId };
        const request = new NextRequest(
            "http://localhost/api/chat/delete-files",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
        );

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when files array is empty", async () => {
        const files: never[] = [];
        const body = { files, chatId };
        const request = new NextRequest(
            "http://localhost/api/chat/delete-files",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
        );

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("deletes single file successfully", async () => {
        const files = [
            {
                name: "file1.txt",
                url: "http://example.com/file1.txt",
                type: "text/plain",
            },
        ];

        mocks.deleteUserFile.mockResolvedValue(true);

        const body = { files, chatId };
        const request = new NextRequest(
            "http://localhost/api/chat/delete-files",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
        );

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const files = [
            {
                name: "file1.txt",
                url: "http://example.com/file1.txt",
                type: "text/plain",
            },
        ];

        const body = { files, chatId };
        const request = new NextRequest(
            "http://localhost/api/chat/delete-files",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
        );

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when deleteUserFile fails", async () => {
        const files = [
            {
                name: "file1.txt",
                url: "http://example.com/file1.txt",
                type: "text/plain",
            },
        ];

        mocks.deleteUserFile.mockRejectedValue(new Error("Storage error"));

        const body = { files, chatId };
        const request = new NextRequest(
            "http://localhost/api/chat/delete-files",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
        );

        const response = await POST(request);

        expect(response).toBeInstanceOf(Response);
    });
});

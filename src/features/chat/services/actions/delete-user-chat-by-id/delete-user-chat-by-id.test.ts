import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { handleApiError } from "@/lib/utils/handle-api-error";

import { deleteUserChatById } from "./delete-user-chat-by-id";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    chatId: "30000000-0000-0000-0000-000000000abc",
}));

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    deleteStorageDirectory: vi.fn(),
    isUserChatOwner: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: constants.userId, name: "Test User" },
    }),
}));

const apiSuccess = { ok: true };
const apiError = { ok: false };
const apiNotFound = { ok: false, reason: "not-found" };
const apiAuthError = { ok: false, reason: "authorization" };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                delete: vi.fn(() => apiSuccess),
            },
        },
        error: {
            chat: {
                delete: vi.fn(() => apiError),
            },
            session: {
                authorization: vi.fn(() => apiAuthError),
            },
        },
    },
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: mocks.deleteStorageDirectory,
}));

vi.mock("@/features/chat/services/db", () => ({
    isUserChatOwner: mocks.isUserChatOwner,
}));

describe("deleteUserChatById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
        mocks.isUserChatOwner.mockResolvedValue(true);
        mocks.deleteStorageDirectory.mockResolvedValue(undefined);
    });

    it("deletes chat successfully", async () => {
        const mkDelete = () =>
            ({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }) as any;

        const returns = [mkDelete(), mkDelete()];
        mocks.from.mockImplementation(() => returns.shift() || mkDelete());

        const result = await deleteUserChatById({
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiSuccess);
        expect(mocks.deleteStorageDirectory).toHaveBeenCalledTimes(3);
    });

    it("returns authorization error when user is not owner", async () => {
        mocks.isUserChatOwner.mockResolvedValue(false);

        const result = await deleteUserChatById({
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiAuthError);
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it("returns error when message delete fails", async () => {
        const failingChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
            }),
        } as any;

        mocks.from.mockReturnValue(failingChain);

        const result = await deleteUserChatById({
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chat delete fails", async () => {
        const mkDelete = (shouldError: boolean) =>
            ({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: shouldError ? { message: "fail" } : null,
                    }),
                }),
            }) as any;

        const calls: boolean[] = [false, true];
        mocks.from.mockImplementation(() => mkDelete(calls.shift() || false));

        const result = await deleteUserChatById({
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatId is invalid", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(() => apiError as any);

        const result = await deleteUserChatById({
            chatId: "not-a-uuid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

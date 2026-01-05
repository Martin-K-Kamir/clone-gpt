import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { deleteAllUserChats } from "./delete-all-user-chats";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
}));

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    deleteStorageDirectory: vi.fn(),
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
        },
    },
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: mocks.deleteStorageDirectory,
}));

describe("deleteAllUserChats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
        mocks.deleteStorageDirectory.mockResolvedValue(undefined);
    });

    it("should delete all chats successfully", async () => {
        const mkDelete = () =>
            ({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }) as any;

        const returns = [mkDelete(), mkDelete()];
        mocks.from.mockImplementation(() => returns.shift() || mkDelete());

        const result = await deleteAllUserChats();

        expect(result).toEqual(apiSuccess);
        expect(mocks.deleteStorageDirectory).toHaveBeenCalledTimes(3);
    });

    it("should return error when message delete fails", async () => {
        const failingChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
            }),
        } as any;

        mocks.from.mockReturnValue(failingChain);

        const result = await deleteAllUserChats();

        expect(result).toEqual(apiError);
    });

    it("should return error when chat delete fails", async () => {
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

        const result = await deleteAllUserChats();

        expect(result).toEqual(apiError);
    });
});

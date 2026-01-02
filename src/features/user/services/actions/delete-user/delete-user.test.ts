import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { handleApiError } from "@/lib/utils/handle-api-error";

import { deleteUser } from "./delete-user";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
}));

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: constants.userId } }),
}));

const apiSuccess = { ok: true };
const apiError = { ok: false };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                delete: vi.fn(() => apiSuccess),
            },
        },
        error: {
            user: {
                delete: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("@/lib/cache-tag", () => ({
    tag: {
        user: (id: string) => `user-${id}`,
        userChatPreferences: (id: string) => `prefs-${id}`,
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiError: vi.fn((_err, fallback) => fallback()),
}));

describe("deleteUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({ user: { id: constants.userId } });
    });

    it("returns success when all deletes pass", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(
            () => apiSuccess as any,
        );

        const mkDelete = () =>
            ({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({ error: null }),
                }),
            }) as any;

        const userDeleteChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: constants.userId },
                            error: null,
                        }),
                    }),
                }),
            }),
        } as any;

        const returns = [
            mkDelete(), // messages
            mkDelete(), // chats
            mkDelete(), // user_messages_rate_limits
            mkDelete(), // user_files_rate_limits
            mkDelete(), // user_preferences
            userDeleteChain, // users
        ];
        mocks.from.mockImplementation(() => returns.shift() || mkDelete());

        const result = await deleteUser();

        expect(result).toBe(apiSuccess);
    });

    it("returns api error when a delete fails", async () => {
        const failingChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: { message: "boom" } }),
            }),
        } as any;

        mocks.from.mockReturnValue(failingChain);

        const result = await deleteUser();

        expect(result).toBe(apiError);
    });

    it("returns api error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const result = await deleteUser();

        expect(result).toBe(apiError);
    });

    it("returns api error when userId is invalid", async () => {
        (auth as any).mockResolvedValueOnce({ user: { id: "not-a-uuid" } });

        const result = await deleteUser();

        expect(result).toBe(apiError);
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { handleApiError } from "@/lib/utils/handle-api-error";

import { upsertUserChatPreferences } from "./upsert-user-chat-preferences";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    prefs: { personality: "FRIENDLY", nickname: "Alpha" },
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
const apiNotFound = { ok: false, reason: "not-found" };
const apiError = { ok: false, reason: "error" };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                updateChatPreferences: vi.fn((_data: any) => apiSuccess),
            },
        },
        error: {
            user: {
                notFound: vi.fn(() => apiNotFound),
                updateChatPreferences: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("@/lib/cache-tag", () => ({
    tag: {
        userChatPreferences: (id: string) => `prefs-${id}`,
    },
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiError: vi.fn((_err, fallback) => fallback()),
}));

describe("upsertUserChatPreferences", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({ user: { id: constants.userId } });
    });

    it("returns success when upsert works", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(
            () => apiSuccess as any,
        );

        mocks.from.mockImplementation(() => ({
            upsert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { userId: constants.userId, ...constants.prefs },
                        error: null,
                    }),
                }),
            }),
        }));

        const result = await upsertUserChatPreferences({
            userChatPreferences: constants.prefs as any,
        });

        expect(result).toBe(apiSuccess);
    });

    it("returns not found when supabase returns null", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(
            () => apiNotFound as any,
        );

        mocks.from.mockImplementation(() => ({
            upsert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        }));

        const result = await upsertUserChatPreferences({
            userChatPreferences: constants.prefs as any,
        });

        expect(result).toBe(apiNotFound);
    });

    it("returns api error on supabase error", async () => {
        mocks.from.mockImplementation(() => ({
            upsert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        }));

        const result = await upsertUserChatPreferences({
            userChatPreferences: constants.prefs as any,
        });

        expect(result).toBe(apiError);
    });

    it("returns api error when session is missing", async () => {
        (auth as any).mockResolvedValue(null);

        const result = await upsertUserChatPreferences({
            userChatPreferences: constants.prefs as any,
        });

        expect(result).toBe(apiError);
    });

    it("returns api error when userId is invalid", async () => {
        (auth as any).mockResolvedValue({ user: { id: "not-a-uuid" } });

        const result = await upsertUserChatPreferences({
            userChatPreferences: constants.prefs as any,
        });

        expect(result).toBe(apiError);
    });

    it("returns api error when userChatPreferences validation fails", async () => {
        const result = await upsertUserChatPreferences({
            userChatPreferences: {} as any,
        });

        expect(result).toBe(apiError);
    });
});

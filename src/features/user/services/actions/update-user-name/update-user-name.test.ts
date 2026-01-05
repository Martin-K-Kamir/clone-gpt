import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleApiError } from "@/lib/utils/handle-api-error";

import { updateUserName } from "./update-user-name";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
}));

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    auth: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: mocks.auth,
}));

const apiSuccess = { ok: true, name: "New Name" };
const apiNotFound = { ok: false, reason: "not-found" };
const apiError = { ok: false, reason: "error" };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                updateName: vi.fn(_name => apiSuccess),
            },
        },
        error: {
            user: {
                notFound: vi.fn(() => apiNotFound),
                updateName: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("@/lib/cache-tag", () => ({
    tag: {
        user: (id: string) => `user-${id}`,
    },
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiError: vi.fn((_err, fallback) => fallback()),
}));

describe("updateUserName", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({ user: { id: constants.userId } } as any);
    });

    it("should update name successfully", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(
            () => apiSuccess as any,
        );

        mocks.from.mockImplementation(() => ({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: constants.userId, name: "New Name" },
                            error: null,
                        }),
                    }),
                }),
            }),
        }));

        const result = await updateUserName({ newName: "New Name" });

        expect(result).toBe(apiSuccess);
    });

    it("should return api error when session is missing", async () => {
        mocks.auth.mockResolvedValue(null as any);

        const result = await updateUserName({ newName: "New Name" });

        expect(result).toBe(apiError);
    });

    it("should return api error when name validation fails", async () => {
        const result = await updateUserName({ newName: "" });

        expect(result).toBe(apiError);
    });

    it("should return not found when record does not exist", async () => {
        vi.mocked(handleApiError).mockImplementationOnce(
            () => apiNotFound as any,
        );

        mocks.from.mockImplementation(() => ({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            }),
        }));

        const result = await updateUserName({ newName: "New Name" });

        expect(result).toBe(apiNotFound);
    });

    it("should return error when update fails", async () => {
        mocks.from.mockImplementation(() => ({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "fail" },
                        }),
                    }),
                }),
            }),
        }));

        const result = await updateUserName({ newName: "New Name" });

        expect(result).toBe(apiError);
    });
});

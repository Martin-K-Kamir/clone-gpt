import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserByEmail } from "./get-user-by-email";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserByEmail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when email is invalid", async () => {
        await expect(
            getUserByEmail({ email: "not-an-email" as any }),
        ).rejects.toThrow();
    });

    it("returns user on success", async () => {
        const mockUser = { id: "u1", email: "a@example.com" };
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: mockUser,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getUserByEmail({ email: "a@example.com" });

        expect(result).toEqual(mockUser);
    });

    it("returns null when record does not exist", async () => {
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { code: "PGRST116" },
                    }),
                }),
            }),
        });

        const result = await getUserByEmail({ email: "missing@example.com" });

        expect(result).toBeNull();
    });

    it("throws on other errors", async () => {
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { code: "XX", message: "fail" },
                    }),
                }),
            }),
        });

        await expect(
            getUserByEmail({ email: "err@example.com" }),
        ).rejects.toThrow("Failed to fetch user by email");
    });
});

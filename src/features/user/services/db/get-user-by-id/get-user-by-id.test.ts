import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserById } from "./get-user-by-id";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

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

describe("getUserById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            getUserById({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("returns user on success", async () => {
        const mockUser = { id: "u1", email: "a@example.com", name: "A" };
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

        const result = await getUserById({ userId });

        expect(result).toEqual(mockUser);
    });

    it("throws when not found (PGRST116)", async () => {
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

        await expect(getUserById({ userId })).rejects.toThrow(
            "Failed to fetch user by ID",
        );
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

        await expect(getUserById({ userId })).rejects.toThrow(
            "Failed to fetch user by ID",
        );
    });
});

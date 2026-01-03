import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGuestUser } from "./create-guest-user";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("createGuestUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns created guest user", async () => {
        const mockUser = {
            id: "user-1",
            email: "guest-123@example.com",
            name: "Guest",
            role: "guest",
        };

        mocks.from.mockReturnValue({
            insert: mocks.insert.mockReturnValue({
                select: mocks.select.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: mockUser,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await createGuestUser();

        expect(result).toEqual(mockUser);
        expect(result.role).toBe("guest");
        expect(result.email).toContain("guest-");
    });

    it("throws when creation fails", async () => {
        mocks.from.mockReturnValue({
            insert: mocks.insert.mockReturnValue({
                select: mocks.select.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        });

        await expect(createGuestUser()).rejects.toThrow("fail");
    });
});

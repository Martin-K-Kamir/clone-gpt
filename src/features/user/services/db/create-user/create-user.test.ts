import { beforeEach, describe, expect, it, vi } from "vitest";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { createUser } from "./create-user";

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

describe("createUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when validation fails", async () => {
        await expect(
            createUser({ email: "", name: "", password: null } as any),
        ).rejects.toThrow();
    });

    it("should create user with default role", async () => {
        const mockUser = {
            id: "user-1",
            email: "a@example.com",
            name: "A",
            role: USER_ROLE.USER,
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

        const result = await createUser({
            email: mockUser.email,
            name: mockUser.name,
            password: null,
        });

        expect(result).toEqual(mockUser);
        expect(result?.role).toBe(USER_ROLE.USER);
    });

    it("should create user with explicit role", async () => {
        const mockUser = {
            id: "user-2",
            email: "b@example.com",
            name: "B",
            role: USER_ROLE.ADMIN,
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

        const result = await createUser({
            email: mockUser.email,
            name: mockUser.name,
            role: USER_ROLE.ADMIN,
            password: null,
        });

        expect(result?.role).toBe(USER_ROLE.ADMIN);
    });

    it("should throw when creation fails", async () => {
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

        await expect(
            createUser({ email: "c@example.com", name: "C", password: null }),
        ).rejects.toThrow("fail");
    });
});

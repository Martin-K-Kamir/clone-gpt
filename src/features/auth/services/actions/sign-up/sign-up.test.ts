import { beforeEach, describe, expect, it, vi } from "vitest";

import { signUp } from "./sign-up";

const mocks = vi.hoisted(() => ({
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    hashPassword: vi.fn(),
}));

vi.mock("@/features/user/services/db", () => ({
    getUserByEmail: mocks.getUserByEmail,
    createUser: mocks.createUser,
}));

vi.mock("@/features/auth/lib/utils/hash-password", () => ({
    hashPassword: mocks.hashPassword,
}));

const apiSuccess = { success: true as const };
const apiError = { success: false as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            auth: {
                signup: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                })),
            },
        },
        error: {
            auth: {
                validation: vi.fn((error: any) => ({
                    ...apiError,
                    error,
                })),
                emailExists: vi.fn((email: string) => ({
                    ...apiError,
                    message: `Email ${email} already exists`,
                })),
                general: vi.fn((error?: any) => ({
                    ...apiError,
                    error,
                })),
            },
        },
    },
}));

describe("signUp", () => {
    const mockUser = {
        id: "00000000-0000-0000-0000-000000000001",
        email: "test@example.com",
        name: "Test User",
        image: null,
        role: "user" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.hashPassword.mockResolvedValue("hashed-password");
    });

    it("creates user on success", async () => {
        mocks.getUserByEmail.mockResolvedValue(null);
        mocks.createUser.mockResolvedValue(mockUser);

        const result = await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(true);
    });

    it("returns error when validation fails", async () => {
        const result = await signUp({
            name: "A",
            email: "invalid-email",
            password: "short",
            confirmPassword: "different",
        });

        expect(result.success).toBe(false);
    });

    it("returns error when email already exists", async () => {
        mocks.getUserByEmail.mockResolvedValue(mockUser);

        const result = await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("returns error when passwords do not match", async () => {
        const result = await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password456",
        });

        expect(result.success).toBe(false);
    });

    it("returns error when createUser fails", async () => {
        mocks.getUserByEmail.mockResolvedValue(null);
        mocks.createUser.mockResolvedValue(null);

        const result = await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("returns error when getUserByEmail throws", async () => {
        mocks.getUserByEmail.mockRejectedValue(new Error("Database error"));

        const result = await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("hashes password before creating user", async () => {
        mocks.getUserByEmail.mockResolvedValue(null);
        mocks.createUser.mockResolvedValue(mockUser);

        await signUp({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        });

        expect(mocks.hashPassword).toHaveBeenCalledWith("password123");
        expect(mocks.createUser).toHaveBeenCalledWith({
            email: "test@example.com",
            name: "Test User",
            password: "hashed-password",
        });
    });
});

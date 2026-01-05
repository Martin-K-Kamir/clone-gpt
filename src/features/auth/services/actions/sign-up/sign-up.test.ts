import {
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
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
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.hashPassword.mockResolvedValue("hashed-password");
    });

    it("should create user on success", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const mockUser = {
            id: userId,
            email,
            name: "Test User",
            image: null,
            role: "user" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getUserByEmail.mockResolvedValue(null);
        mocks.createUser.mockResolvedValue(mockUser);

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(true);
    });

    it("should return error when validation fails", async () => {
        const result = await signUp({
            name: "A",
            email: "invalid-email",
            password: "short",
            confirmPassword: "different",
        });

        expect(result.success).toBe(false);
    });

    it("should return error when email already exists", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const mockUser = {
            id: userId,
            email,
            name: "Test User",
            image: null,
            role: "user" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getUserByEmail.mockResolvedValue(mockUser);

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("should return error when passwords do not match", async () => {
        const email = generateUserEmail();

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password456",
        });

        expect(result.success).toBe(false);
    });

    it("should return error when createUser fails", async () => {
        const email = generateUserEmail();

        mocks.getUserByEmail.mockResolvedValue(null);
        mocks.createUser.mockResolvedValue(null);

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("should return error when getUserByEmail throws", async () => {
        const email = generateUserEmail();

        mocks.getUserByEmail.mockRejectedValue(new Error("Database error"));

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);
    });
});

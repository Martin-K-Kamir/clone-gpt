import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { hashPassword } from "./hash-password";

vi.mock("bcryptjs", () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
    },
}));

describe("hashPassword", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return a string", async () => {
        (bcrypt.genSalt as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$salt",
        );
        (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$hashedpassword",
        );

        const result = await hashPassword("test-password");

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should hash different passwords", async () => {
        (bcrypt.genSalt as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$salt",
        );
        (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$hashedpassword",
        );

        const password1 = "password1";
        const password2 = "password2";

        const result1 = await hashPassword(password1);
        const result2 = await hashPassword(password2);

        expectTypeOf(result1).toEqualTypeOf<string>();
        expectTypeOf(result2).toEqualTypeOf<string>();
        expect(typeof result1).toBe("string");
        expect(typeof result2).toBe("string");
    });

    it("should handle empty password", async () => {
        (bcrypt.genSalt as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$salt",
        );
        (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$hashedpassword",
        );

        const result = await hashPassword("");

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should handle long passwords", async () => {
        (bcrypt.genSalt as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$salt",
        );
        (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$hashedpassword",
        );

        const longPassword = "a".repeat(1000);
        const result = await hashPassword(longPassword);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should handle special characters in password", async () => {
        (bcrypt.genSalt as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$salt",
        );
        (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
            "$2a$10$hashedpassword",
        );

        const specialPassword = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const result = await hashPassword(specialPassword);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });
});

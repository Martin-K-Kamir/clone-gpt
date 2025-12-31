import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { comparePassword } from "./compare-password";

vi.mock("bcryptjs", () => ({
    default: {
        compare: vi.fn(),
    },
}));

describe("comparePassword", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return a boolean", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await comparePassword("password", "$2a$10$hashed");

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(typeof result).toBe("boolean");
    });

    it("should return true when password matches", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await comparePassword(
            "correct-password",
            "$2a$10$hashedpassword",
        );

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(result).toBe(true);
    });

    it("should return false when password does not match", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await comparePassword(
            "wrong-password",
            "$2a$10$hashedpassword",
        );

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(result).toBe(false);
    });

    it("should call bcrypt.compare with correct arguments", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const password = "test-password";
        const hashedPassword = "$2a$10$hashedpassword";

        await comparePassword(password, hashedPassword);

        expect(
            bcrypt.default.compare as ReturnType<typeof vi.fn>,
        ).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("should handle empty password", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await comparePassword("", "$2a$10$hashedpassword");

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(result).toBe(false);
    });

    it("should handle empty hashed password", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await comparePassword("password", "");

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(result).toBe(false);
    });

    it("should handle special characters in password", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const specialPassword = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const result = await comparePassword(
            specialPassword,
            "$2a$10$hashedpassword",
        );

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(typeof result).toBe("boolean");
    });

    it("should handle long passwords", async () => {
        const bcrypt = await import("bcryptjs");

        (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const longPassword = "a".repeat(1000);
        const result = await comparePassword(
            longPassword,
            "$2a$10$hashedpassword",
        );

        expectTypeOf(result).toEqualTypeOf<boolean>();
        expect(typeof result).toBe("boolean");
    });
});

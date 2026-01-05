import {
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/services/supabase";

import { signUp } from "./sign-up";

describe("signUp", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it("should create user on success", async () => {
        const email = generateUserEmail();

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.email).toBe(email);
            expect(result.data.name).toBe("Test User");
            expect(result.data.role).toBe("user");

            const { data: user } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            expect(user).toBeTruthy();
            expect(user?.email).toBe(email);
            expect(user?.name).toBe("Test User");
            expect(user?.role).toBe("user");
        }

        await supabase.from("users").delete().eq("email", email);
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
        const email = generateUserEmail();
        const userId = generateUserId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Existing User",
            role: "user",
            password: "hashed-password",
        });

        const result = await signUp({
            name: "New User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(false);

        await supabase.from("users").delete().eq("id", userId);
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

        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        expect(user).toBeNull();
    });

    it("should store hashed password", async () => {
        const email = generateUserEmail();

        const result = await signUp({
            name: "Test User",
            email,
            password: "password123",
            confirmPassword: "password123",
        });

        expect(result.success).toBe(true);

        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        expect(user?.password).toBeTruthy();
        expect(user?.password).not.toBe("password123");

        await supabase.from("users").delete().eq("email", email);
    });
});

import { describe, expect, it } from "vitest";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { createUser } from "./create-user";

describe("createUser", () => {
    it("should create user with default role", async () => {
        const email = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        const user = await createUser({
            email,
            name: "Test User",
            password: null,
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
        expect(user?.name).toBe("Test User");
        expect(user?.role).toBe(USER_ROLE.USER);

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });

    it("should create user with explicit role", async () => {
        const email = `test-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        const user = await createUser({
            email,
            name: "Test Admin",
            role: USER_ROLE.ADMIN,
            password: null,
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
        expect(user?.name).toBe("Test Admin");
        expect(user?.role).toBe(USER_ROLE.ADMIN);

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });
});

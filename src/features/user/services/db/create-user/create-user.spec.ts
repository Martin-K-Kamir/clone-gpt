import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { createUser } from "./create-user";

describe("createUser", () => {
    it("creates user with default role", async () => {
        const email = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        const user = await createUser({
            email,
            name: "Test User",
            password: null,
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
        expect(user?.name).toBe("Test User");
        expect(user?.role).toBe("user");

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });

    it("creates user with explicit role", async () => {
        const email = `test-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        const user = await createUser({
            email,
            name: "Test Admin",
            role: "admin",
            password: null,
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
        expect(user?.name).toBe("Test Admin");
        expect(user?.role).toBe("admin");

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });
});

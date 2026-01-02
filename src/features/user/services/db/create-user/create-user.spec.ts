import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { createUser } from "./create-user";

describe("createUser", () => {
    it("creates a user with default role user", async () => {
        const email = `int-user-${Date.now()}@example.com`;
        const user = await createUser({
            email,
            name: "Integration User",
            password: null,
        });

        expect(user).toBeTruthy();
        expect(user?.email).toBe(email);
        expect(user?.role).toBe("user");

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });

    it("creates a user with explicit role admin", async () => {
        const email = `int-admin-${Date.now()}@example.com`;
        const user = await createUser({
            email,
            name: "Integration Admin",
            role: "admin",
            password: null,
        });

        expect(user).toBeTruthy();
        expect(user?.email).toBe(email);
        expect(user?.role).toBe("admin");

        if (user?.id) {
            await supabase.from("users").delete().eq("id", user.id);
        }
    });
});

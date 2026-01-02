import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { createGuestUser } from "./create-guest-user";

describe("createGuestUser", () => {
    it("creates a guest user with role guest and generated email", async () => {
        const user = await createGuestUser();

        expect(user).toBeTruthy();
        expect(user.role).toBe("guest");
        expect(user.email).toContain("guest-");

        await supabase.from("users").delete().eq("id", user.id);
    });
});

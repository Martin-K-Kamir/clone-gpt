import { describe, expect, it } from "vitest";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { createGuestUser } from "./create-guest-user";

describe("createGuestUser", () => {
    it("should create a guest user with role guest and generated email", async () => {
        const user = await createGuestUser();

        expect(user).toBeTruthy();
        expect(user.role).toBe(USER_ROLE.GUEST);
        expect(user.email).toContain("guest-");

        await supabase.from("users").delete().eq("id", user.id);
    });
});

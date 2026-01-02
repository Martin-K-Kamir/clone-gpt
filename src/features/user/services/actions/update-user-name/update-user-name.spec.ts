import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserName } from "./update-user-name";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000124" as DBUserId,
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: constants.userId } }),
}));

vi.mock("@/features/auth/lib/asserts", () => ({
    assertSessionExists: vi.fn(),
}));

vi.mock("@/features/user/lib/asserts", () => ({
    assertIsDBUserId: vi.fn(),
}));

describe("updateUserName", () => {
    beforeEach(async () => {
        await supabase.from("users").delete().eq("id", constants.userId);
        await supabase.from("users").insert({
            id: constants.userId,
            email: "update-name@example.com",
            name: "Old Name",
            role: "user",
        });
    });

    it("updates the user name", async () => {
        const result = await updateUserName({ newName: "New Name" });
        expect(result).toBeDefined();

        const { data } = await supabase
            .from("users")
            .select("name")
            .eq("id", constants.userId)
            .single();

        expect(data?.name).toBe("New Name");
    });
});

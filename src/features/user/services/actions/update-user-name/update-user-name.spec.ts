import {
    generateUniqueEmail,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserName } from "./update-user-name";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("updateUserName", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates the user name", async () => {
        const userId = generateUniqueUserId() as DBUserId;
        const email = generateUniqueEmail();

        vi.mocked(auth).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Old Name",
                image: null,
                role: "user",
            },
        } as any);

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Old Name",
            role: "user",
        });

        const result = await updateUserName({ newName: "New Name" });
        expect(result).toBeDefined();

        const { data } = await supabase
            .from("users")
            .select("name")
            .eq("id", userId)
            .single();

        expect(data?.name).toBe("New Name");
    });
});

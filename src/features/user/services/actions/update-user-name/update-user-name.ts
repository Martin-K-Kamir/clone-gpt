"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { assertIsNonEmptyString } from "@/lib/asserts";
import { tag } from "@/lib/cache-tag";
import type { WithNewName } from "@/lib/types";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function updateUserName({ newName }: WithNewName) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsNonEmptyString(newName);

        const { data, error } = await supabase
            .from("users")
            .update({ name: newName })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        updateTag(tag.user(userId));

        if (!data) {
            return api.error.user.notFound();
        }

        return api.success.user.updateName(data.name);
    } catch (error) {
        return handleApiError(error, () => api.error.user.updateName(error));
    }
}

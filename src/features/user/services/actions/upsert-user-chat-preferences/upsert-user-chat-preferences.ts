"use server";

import { updateTag } from "next/cache";
import z from "zod";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBUserId,
    assertIsUserChatPreferences,
} from "@/features/user/lib/asserts";
import { userChatPreferenceSchema } from "@/features/user/lib/schemas";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

type UpsertUserChatPreferencesProps = {
    userChatPreferences: z.infer<typeof userChatPreferenceSchema>;
};

export async function upsertUserChatPreferences({
    userChatPreferences,
}: UpsertUserChatPreferencesProps) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsUserChatPreferences(userChatPreferences);

        const { data, error } = await supabase
            .from("user_preferences")
            .upsert(
                {
                    userId,
                    ...userChatPreferences,
                },
                {
                    onConflict: "userId",
                    ignoreDuplicates: false,
                },
            )
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        updateTag(tag.userChatPreferences(userId));

        if (!data) {
            return api.error.user.notFound();
        }

        return api.success.user.updateChatPreferences(data);
    } catch (error) {
        return handleApiError(error, () =>
            api.error.user.updateChatPreferences(error),
        );
    }
}

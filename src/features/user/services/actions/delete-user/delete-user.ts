"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function deleteUser() {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);

        const { error: chatsError } = await supabase
            .from("messages")
            .delete()
            .eq("userId", userId);

        if (chatsError) {
            throw new Error(
                `Failed to delete user messages: ${chatsError.message}`,
            );
        }

        const { error: messagesError } = await supabase
            .from("chats")
            .delete()
            .eq("userId", userId);

        if (messagesError) {
            throw new Error(
                `Failed to delete user chats: ${messagesError.message}`,
            );
        }

        const { error: messagesRateLimitError } = await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);

        if (messagesRateLimitError) {
            throw new Error(
                `Failed to delete user messages rate limit: ${messagesRateLimitError.message}`,
            );
        }

        const { error: filesRateLimitError } = await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", userId);

        if (filesRateLimitError) {
            throw new Error(
                `Failed to delete user files rate limit: ${filesRateLimitError.message}`,
            );
        }

        const { error: preferencesError } = await supabase
            .from("user_preferences")
            .delete()
            .eq("userId", userId);

        if (preferencesError) {
            throw new Error(
                `Failed to delete user preferences: ${preferencesError.message}`,
            );
        }

        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }

        updateTag(tag.user(userId));
        updateTag(tag.userChatPreferences(userId));

        if (!data) {
            return api.error.user.notFound();
        }

        return api.success.user.delete(data);
    } catch (error) {
        return handleApiError(error, () => api.error.user.delete(error));
    }
}

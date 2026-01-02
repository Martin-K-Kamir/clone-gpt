import { supabase } from "@/services/supabase";

/**
 * Waits for data to exist in the database with retries
 */
export async function waitForMessage(
    messageId: string,
    maxRetries = 5,
    delayMs = 200,
): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        if (data) {
            return data;
        }

        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return null;
}

export async function waitForChat(
    chatId: string,
    maxRetries = 5,
    delayMs = 200,
): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
        const { data } = await supabase
            .from("chats")
            .select("*")
            .eq("id", chatId)
            .single();

        if (data) {
            return data;
        }

        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return null;
}

export async function waitForMessages(
    messageIds: string[],
    maxRetries = 5,
    delayMs = 200,
): Promise<any[]> {
    for (let i = 0; i < maxRetries; i++) {
        const { data } = await supabase
            .from("messages")
            .select("*")
            .in("id", messageIds)
            .order("createdAt", { ascending: true });

        if (data && data.length === messageIds.length) {
            return data;
        }

        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return [];
}

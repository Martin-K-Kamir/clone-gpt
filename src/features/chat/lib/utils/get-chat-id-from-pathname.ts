import z from "zod";

import type { DBChatId } from "@/features/chat/lib/types";

export function getChatIdFromPathname(pathname: string): DBChatId | null {
    const uuidMatch = pathname.match(
        /\/chat\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    );

    if (!uuidMatch) {
        return null;
    }

    const chatId = uuidMatch[1];
    const schema = z.string().uuid();
    const result = schema.safeParse(chatId);

    if (!result.success) {
        return null;
    }

    return result.data as DBChatId;
}

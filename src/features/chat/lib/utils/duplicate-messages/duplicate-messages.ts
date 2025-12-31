import type {
    DBChatMessageId,
    UIChatMessage,
    WithMessages,
    WithNewChatId,
} from "@/features/chat/lib/types";
import { duplicateMessageMetadata } from "@/features/chat/lib/utils/duplicate-message-metadata";
import { duplicateMessageParts } from "@/features/chat/lib/utils/duplicate-message-parts";

import type { WithUserId } from "@/features/user/lib/types";

export async function duplicateMessages({
    messages,
    userId,
    newChatId,
}: WithMessages & WithUserId & WithNewChatId): Promise<UIChatMessage[]> {
    return await Promise.all(
        messages.map(async message => ({
            ...message,
            id: crypto.randomUUID() as DBChatMessageId,
            metadata: duplicateMessageMetadata(message.metadata),
            parts: await duplicateMessageParts({
                userId,
                newChatId,
                parts: message.parts,
            }),
        })),
    );
}

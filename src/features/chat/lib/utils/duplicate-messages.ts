import type { WithUserId } from "@/features/user/lib/types";

import type {
    DBChatMessageId,
    UIChatMessage,
    WithMessages,
    WithNewChatId,
} from "../types";
import { duplicateMessageMetadata } from "./duplicate-message-metadata";
import { duplicateMessageParts } from "./duplicate-message-parts";

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

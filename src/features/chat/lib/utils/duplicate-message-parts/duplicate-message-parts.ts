import type { UIChatMessage, WithNewChatId } from "@/features/chat/lib/types";
import { duplicateMessagePart } from "@/features/chat/lib/utils/duplicate-message-part";

import type { WithUserId } from "@/features/user/lib/types";

export async function duplicateMessageParts({
    parts,
    userId,
    newChatId,
}: {
    parts: UIChatMessage["parts"];
} & WithUserId &
    WithNewChatId): Promise<UIChatMessage["parts"]> {
    if (!Array.isArray(parts) || parts.length === 0) {
        return parts;
    }

    return Promise.all(
        parts.map(part => duplicateMessagePart({ part, userId, newChatId })),
    );
}

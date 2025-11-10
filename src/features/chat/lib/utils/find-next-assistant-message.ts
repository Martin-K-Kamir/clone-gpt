import { CHAT_ROLE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

export function findNextAssistantMessage(
    messages: UIChatMessage[],
    messageIndex: number,
): UIChatMessage | undefined {
    return messages.find(
        (message, index) =>
            index > messageIndex && message.role === CHAT_ROLE.ASSISTANT,
    );
}

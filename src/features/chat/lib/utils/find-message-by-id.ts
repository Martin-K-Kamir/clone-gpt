import type { UIChatMessage } from "@/features/chat/lib/types";

export function findMessageById(
    messages: UIChatMessage[],
    messageId: string,
): UIChatMessage | undefined {
    return messages.find(message => message.id === messageId);
}

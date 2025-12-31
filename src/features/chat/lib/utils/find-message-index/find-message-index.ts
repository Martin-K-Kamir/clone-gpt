import type { UIChatMessage } from "@/features/chat/lib/types";

export function findMessageIndex(
    messages: UIChatMessage[],
    messageId: string,
): number {
    return messages.findIndex(message => message.id === messageId);
}

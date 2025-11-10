import type { UIChatMessage } from "../types";

export function findMessageIndex(
    messages: UIChatMessage[],
    messageId: string,
): number {
    return messages.findIndex(message => message.id === messageId);
}

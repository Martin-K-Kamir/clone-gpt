import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

export function updateMessageParts(
    messages: UIChatMessage[],
    messageId: string,
    newText: string,
): UIChatMessage[] {
    return messages.map(message =>
        message.id === messageId
            ? {
                  ...message,
                  parts: [
                      {
                          text: newText,
                          type: CHAT_MESSAGE_TYPE.TEXT,
                      },
                  ],
              }
            : message,
    );
}

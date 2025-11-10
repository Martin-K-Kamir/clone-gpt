import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

export function checkForFilesInMessage(message: UIChatMessage) {
    return message.parts.some(
        part =>
            ("kind" in part && part.kind === CHAT_MESSAGE_TYPE.FILE) ||
            part.type === "file",
    );
}

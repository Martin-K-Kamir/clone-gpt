import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

export function countFilesInMessage(message: UIChatMessage) {
    return message.parts.filter(
        part =>
            ("kind" in part && part.kind === CHAT_MESSAGE_TYPE.FILE) ||
            part.type === "file",
    ).length;
}

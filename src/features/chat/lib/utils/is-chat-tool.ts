import { CHAT_TOOLS_KEYS } from "../constants";
import type { ChatTool, UIAssistantChatMessage } from "../types";

export function isChatTool(
    part: UIAssistantChatMessage["parts"][number],
): part is Extract<
    UIAssistantChatMessage["parts"][number],
    { type: ChatTool }
> {
    return CHAT_TOOLS_KEYS.includes(part.type as ChatTool);
}

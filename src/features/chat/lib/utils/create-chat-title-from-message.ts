import { UIChatMessage } from "../types";

const NEW_CHAT_MAX_TITLE_LENGTH = 25;

type Options = {
    defaultTitle?: string;
    maxTitleLength?: number;
};

export function createChatTitleFromMessage(
    message: UIChatMessage,
    options?: Options,
) {
    const {
        defaultTitle = "New Chat",
        maxTitleLength = NEW_CHAT_MAX_TITLE_LENGTH,
    } = options ?? {};

    const textPart = message.parts.find(part => part.type === "text");

    if (textPart) {
        return textPart.text.length > maxTitleLength
            ? `${textPart.text.slice(0, maxTitleLength)}...`
            : textPart.text;
    }

    return defaultTitle;
}

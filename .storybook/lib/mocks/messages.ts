import {
    CHAT_MESSAGE_TYPE,
    CHAT_ROLE,
} from "../../../src/features/chat/lib/constants";
import type {
    DBChatMessageId,
    UIAssistantChatMessage,
    UIFileMessagePart,
    UIUserChatMessage,
} from "../../../src/features/chat/lib/types";

export const MOCK_MESSAGE_ID =
    "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
export const MOCK_ASSISTANT_MESSAGE_ID =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

export const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";

export function createMockUserMessage(
    text: string,
    messageId: DBChatMessageId = MOCK_MESSAGE_ID,
): UIUserChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: {
            role: CHAT_ROLE.USER,
            createdAt: FIXED_MESSAGE_DATE,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

export function createMockAssistantMessage(
    text: string,
    messageId: DBChatMessageId = MOCK_ASSISTANT_MESSAGE_ID,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: FIXED_MESSAGE_DATE,
            model: "gpt-4",
            totalTokens: 100,
            isUpvoted: false,
            isDownvoted: false,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

export function createMockUserMessageWithFiles(
    text: string,
    files: UIFileMessagePart[],
    messageId: DBChatMessageId = MOCK_MESSAGE_ID,
): UIUserChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: {
            role: CHAT_ROLE.USER,
            createdAt: FIXED_MESSAGE_DATE,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            ...files,
        ],
    };
}

export function createMockAssistantMessageWithParts(
    parts: UIAssistantChatMessage["parts"],
    messageId: DBChatMessageId = MOCK_ASSISTANT_MESSAGE_ID,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: FIXED_MESSAGE_DATE,
            model: "gpt-4",
            totalTokens: 100,
            isUpvoted: false,
            isDownvoted: false,
        },
        parts,
    };
}

export function createMockMessages(
    count: number,
    baseText: string = "Message",
): Array<UIUserChatMessage | UIAssistantChatMessage> {
    return Array.from({ length: count }, (_, index) => {
        const messageId =
            `${index.toString().padStart(8, "0")}-0000-0000-0000-000000000002` as DBChatMessageId;
        if (index % 2 === 0) {
            return createMockUserMessage(`${baseText} ${index + 1}`, messageId);
        }
        return createMockAssistantMessage(
            `Response to ${baseText} ${index + 1}`,
            messageId,
        );
    });
}

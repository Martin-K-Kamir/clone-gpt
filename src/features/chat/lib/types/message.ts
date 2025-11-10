import { UIDataTypes, UIMessage } from "ai";
import { z } from "zod";

import type { ChatTools } from "@/features/chat/lib/ai/tools/chat-tools";
import {
    assistantChatMessageMetadataSchema,
    chatMessageMetadataSchema,
    userChatMessageMetadataSchema,
} from "@/features/chat/lib/schemas";

import type { DBChatMessageId } from "./db";

export type AssistantChatMessageMetadata = z.infer<
    typeof assistantChatMessageMetadataSchema
>;
export type UserChatMessageMetadata = z.infer<
    typeof userChatMessageMetadataSchema
>;
export type ChatMessageMetadata = z.infer<typeof chatMessageMetadataSchema>;

export type UIChatMessage = Omit<
    UIMessage<ChatMessageMetadata, UIDataTypes, ChatTools>,
    "id"
> & {
    id: DBChatMessageId;
};

type ExtractChatMessageByRole<T extends UIChatMessage, R extends string> =
    T extends UIMessage<infer M, infer D, infer C>
        ? M extends { role: R }
            ? UIMessage<M, D, C>
            : never
        : never;

export type UIAssistantChatMessage = Omit<
    ExtractChatMessageByRole<UIChatMessage, "assistant">,
    "id"
> & {
    id: DBChatMessageId;
};

export type UIUserChatMessage = Omit<
    ExtractChatMessageByRole<UIChatMessage, "user">,
    "id"
> & {
    id: DBChatMessageId;
};

export type ChatMessagePart = UIChatMessage["parts"][number];

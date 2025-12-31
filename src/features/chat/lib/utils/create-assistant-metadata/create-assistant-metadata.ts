import type { TextStreamPart, ToolSet } from "ai";

import type { AssistantChatMessageMetadata } from "@/features/chat/lib/types";

export const createAssistantMetadata = ({
    part,
    model,
}: {
    part: TextStreamPart<ToolSet>;
    model: string;
}) => {
    if (part.type === "start") {
        return {
            model,
            role: "assistant",
            createdAt: new Date().toISOString(),
            isUpvoted: false,
            isDownvoted: false,
        } as AssistantChatMessageMetadata;
    }

    if (part.type === "finish") {
        return {
            totalTokens: part.totalUsage.totalTokens,
        } as AssistantChatMessageMetadata;
    }
};

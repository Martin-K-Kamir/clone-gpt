import type { UIChatMessage } from "@/features/chat/lib/types";

export function duplicateMessageMetadata(metadata: UIChatMessage["metadata"]) {
    if (metadata?.role === "assistant") {
        return {
            ...metadata,
            isUpvoted: false,
            isDownvoted: false,
            totalTokens: 0,
        };
    }

    return metadata;
}

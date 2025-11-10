import { IconRefresh } from "@tabler/icons-react";

import type { DBChatMessageId } from "@/features/chat/lib/types";
import { useChatHandlersContext } from "@/features/chat/providers";

import { ChatMessageButton } from "./chat-message-button";

type ChatMessageRegenerateButtonProps = {
    messageId: DBChatMessageId;
} & Omit<React.ComponentProps<typeof ChatMessageButton>, "children">;

export function ChatMessageRegenerateButton({
    messageId,
    ...props
}: ChatMessageRegenerateButtonProps) {
    const { handleAssistantRegenerate } = useChatHandlersContext();

    const handleRegenerate = () => {
        handleAssistantRegenerate({ messageId });
    };

    return (
        <ChatMessageButton
            tooltip="Try again"
            onClick={handleRegenerate}
            {...props}
        >
            <span className="sr-only">Try again</span>
            <IconRefresh />
        </ChatMessageButton>
    );
}

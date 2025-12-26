import { ChatStatus } from "ai";
import { motion } from "framer-motion";
import React, { memo } from "react";

import type {
    DBChatId,
    UIAssistantChatMessage,
    UIChatMessage,
    UIUserChatMessage,
} from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

import { ChatMessageAssistant } from "./chat-message-assistant";
import { ChatMessageUser } from "./chat-message-user";

type ChatMessageProps = {
    message: UIChatMessage;
    chatId: DBChatId;
    status: ChatStatus;
} & Omit<React.ComponentProps<typeof motion.article>, "children">;

export const PureChatMessage = ({
    message,
    chatId,
    className,
    status,
    ...props
}: ChatMessageProps) => {
    const { role } = message;
    const isUser = role === "user";
    const isAssistant = role === "assistant";

    if (isAssistant && !message.parts.some(part => part.type === "text")) {
        return null;
    }

    return (
        <motion.article
            className={cn("last:min-h-96 last:pb-24", className)}
            data-role={role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
            data-testid="chat-message"
        >
            {isUser && (
                <ChatMessageUser
                    message={message as UIUserChatMessage}
                    status={status}
                />
            )}

            {isAssistant && (
                <ChatMessageAssistant
                    message={message as UIAssistantChatMessage}
                    chatId={chatId}
                    status={status}
                />
            )}
        </motion.article>
    );
};

export const ChatMessage = memo(PureChatMessage);

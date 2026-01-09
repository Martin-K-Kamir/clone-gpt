import { ChatStatus } from "ai";
import React, { memo, useLayoutEffect, useRef, useState } from "react";

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
} & React.ComponentProps<"article">;

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
    const elementRef = useRef<HTMLElement>(null);

    if (isAssistant && !message.parts.some(part => part.type === "text")) {
        return null;
    }

    return (
        <article
            ref={elementRef}
            className={cn(
                "animate-fade-in last:min-h-96 last:pb-24",
                className,
            )}
            data-role={role}
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
        </article>
    );
};

export const ChatMessage = memo(PureChatMessage);

"use client";

import React, { memo, useRef } from "react";

import { HardMemoizedChatGreeting as ChatGreeting } from "@/features/chat/components/chat-greeting";
import { ChatMessage } from "@/features/chat/components/chat-message";
import { useAutoMessageScroll } from "@/features/chat/hooks";
import {
    useChatContext,
    useChatMessagesContext,
    useChatStatusContext,
} from "@/features/chat/providers";

import { cn } from "@/lib/utils";

import { useScrollbarSize } from "@/hooks";

import { ChatMessagesError } from "./chat-messages-error";
import { ChatMessagesLoader } from "./chat-messages-loader";
import { ChatMessagesScrollBottom } from "./chat-messages-scroll-bottom";

const PureChatMessages = ({
    className,
    ...props
}: Omit<React.ComponentProps<"div">, "children">) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const scrollbarSize = useScrollbarSize(containerRef);
    const { messages } = useChatMessagesContext();
    const { status, error } = useChatStatusContext();
    const { chatId } = useChatContext();

    useAutoMessageScroll({
        lastMessageRef,
        containerRef,
        messages,
        status,
    });

    return (
        <div className="relative h-full flex-1 overflow-hidden">
            <div
                ref={containerRef}
                className={cn(
                    "flex h-full w-full flex-1 flex-col overflow-y-auto px-4 pt-12",
                    scrollbarSize === 0 &&
                        "2lg:pr-[calc(var(--scrollbar-size)+1rem)]",
                    className,
                )}
                {...props}
            >
                {messages.length <= 0 && (
                    <div className="grid h-full place-items-center text-center">
                        <ChatGreeting />
                    </div>
                )}

                <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
                    {messages.map((message, index) => {
                        const isLast = index === messages.length - 1;

                        return (
                            <ChatMessage
                                ref={isLast ? lastMessageRef : null}
                                key={message.id}
                                chatId={chatId}
                                message={message}
                                status={status}
                            />
                        );
                    })}

                    <ChatMessagesLoader
                        ref={lastMessageRef}
                        status={status}
                        messages={messages}
                    />
                    <ChatMessagesError status={status} error={error} />
                </div>
            </div>

            <ChatMessagesScrollBottom
                containerRef={containerRef}
                status={status}
            />
        </div>
    );
};

export const ChatMessages = memo(PureChatMessages);

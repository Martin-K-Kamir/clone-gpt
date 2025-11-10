"use client";

import React from "react";

import { MemoizedChatComposer as ChatComposer } from "@/features/chat/components/chat-composer";
import { ChatDragAndDrop } from "@/features/chat/components/chat-drag-and-drop";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import type {
    DBChatId,
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";
import {
    ChatProvider,
    // useChatMessagesContext,
    // useChatStatusContext,
} from "@/features/chat/providers";

import type {
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";

import { cn } from "@/lib/utils";

export function ChatViewBodyContent({
    className,
    ...props
}: Omit<React.ComponentProps<"div">, "children">) {
    // const { messages } = useChatMessagesContext();
    // const { status, error } = useChatStatusContext();

    // console.log({
    //     messages,
    //     status,
    //     error,
    // });

    return (
        <ChatDragAndDrop
            className={cn(
                "relative flex h-full w-full flex-col overflow-hidden",
                className,
            )}
            {...props}
        >
            <ChatMessages />
            <ChatComposer />
        </ChatDragAndDrop>
    );
}

type ChatViewBodyProps = {
    userId: DBUserId;
    isNewChat?: boolean;
    chatId: DBChatId;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    messages?: UIChatMessage[];
    userChatPreferences: DBUserChatPreferences | null;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatViewBody({
    chatId,
    userId,
    isNewChat,
    isOwner,
    userChatPreferences,
    messages = [],
    visibility,
    ...props
}: ChatViewBodyProps) {
    return (
        <ChatProvider
            userId={userId}
            isNewChat={isNewChat}
            isOwner={isOwner}
            chatId={chatId}
            messages={messages}
            userChatPreferences={userChatPreferences}
            visibility={visibility}
        >
            <ChatViewBodyContent {...props} />
        </ChatProvider>
    );
}

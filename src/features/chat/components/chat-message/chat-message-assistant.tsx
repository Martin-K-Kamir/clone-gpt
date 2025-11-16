"use client";

import { ChatStatus } from "ai";
import { useEffect, useState } from "react";

import { MemoizedMarkdown as Markdown } from "@/components/ui/markdown";

import { ChatMessageToolbarAssistant } from "@/features/chat/components/chat-message-toolbar";
import { HardMemoizedChatMessageTools as ChatMessageTools } from "@/features/chat/components/chat-message-tools";
import type {
    DBChatId,
    UIAssistantChatMessage,
} from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatMessageAssistantProps = {
    message: UIAssistantChatMessage;
    chatId: DBChatId;
    classNameContent?: string;
    classNameWrapper?: string;
    status: ChatStatus;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageAssistant({
    message,
    chatId,
    classNameContent,
    classNameWrapper,
    status,
    ...props
}: ChatMessageAssistantProps) {
    const { id: messageId, parts, metadata } = message;
    const [canShowActions, setCanShowActions] = useState(false);

    const content = parts
        .map(part => (part.type === "text" ? part.text : ""))
        .join("");

    const disableImageRendering = parts.some(
        part => part.type === "tool-generateImage",
    );

    const actionsDisabled = status === "streaming" || status === "submitted";

    useEffect(() => {
        if (status === "ready") {
            setCanShowActions(true);
        }
    }, [status]);

    return (
        <div {...props}>
            <p className="sr-only">Assistant response:</p>

            <div
                className={cn(
                    "group/message flex w-full flex-col gap-2 pb-4 sm:pb-10",
                    classNameWrapper,
                )}
            >
                <ChatMessageTools
                    parts={parts}
                    className="mb-2 flex flex-col gap-2"
                />

                <div
                    className={cn(
                        "prose prose-zinc dark:prose-invert w-full max-w-full gap-2 text-zinc-50 [&:not(pre)>code]:bg-zinc-800 [&_pre:has(>div)]:!p-0 [&_pre]:rounded-2xl [&_pre]:!p-6",
                        "prose-inline-code:bg-zinc-700 prose-inline-code:px-1 prose-inline-code:py-0.5 prose-inline-code:rounded-md prose-inline-code:text-zinc-50 prose-inline-code:font-medium",
                        "[&_p:empty]:m-0 [&_p:has(~p:empty)]:mb-0 [&_p:last-of-type_img]:mb-0",
                        classNameContent,
                    )}
                >
                    <Markdown
                        key={`${messageId}-text`}
                        id={messageId}
                        content={content}
                        disableImageRendering={disableImageRendering}
                    />
                </div>

                <ChatMessageToolbarAssistant
                    canShowActions={canShowActions}
                    chatId={chatId}
                    messageId={messageId}
                    content={content}
                    parts={parts}
                    metadata={metadata}
                    disabled={actionsDisabled}
                />
            </div>
        </div>
    );
}

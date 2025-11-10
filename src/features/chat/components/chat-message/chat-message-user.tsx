"use client";

import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { ChatStatus } from "ai";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PromptComposer } from "@/components/ui/prompt-composer";

import { ChatMessageToolbarUser } from "@/features/chat/components/chat-message-toolbar";
import {
    HardMemoizedChatMessageUploadsFiles as ChatMessageUploadsFiles,
    HardMemoizedChatMessageUploadsImages as ChatMessageUploadsImages,
} from "@/features/chat/components/chat-message-uploads";
import {
    CHAT_CHARACTER_MAX_LIMIT,
    CHAT_CHARACTER_MIN_LIMIT,
    CHAT_MESSAGE_TYPE,
} from "@/features/chat/lib/constants";
import type {
    UIFileMessagePart,
    UIUserChatMessage,
} from "@/features/chat/lib/types";
import { useChatHandlersContext } from "@/features/chat/providers";

import { cn } from "@/lib/utils";

const MAX_CONTENT_LENGTH = 150;

type ChatMessageUserProps = {
    message: UIUserChatMessage;
    classNameContent?: string;
    classNameWrapper?: string;
    status: ChatStatus;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageUser({
    message,
    classNameContent,
    classNameWrapper,
    status,
    ...props
}: ChatMessageUserProps) {
    const { parts } = message;
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { handleUserRegenerate } = useChatHandlersContext();

    const content = parts
        .filter(part => ("isVisible" in part ? part.isVisible : true))
        .map(part => (part.type === CHAT_MESSAGE_TYPE.TEXT ? part.text : ""))
        .join("");

    const isTruncated = content.length > MAX_CONTENT_LENGTH;
    const canShowMessage = !isUpdating;
    const canShowPromptForm = isUpdating;
    const canShowActions = !isUpdating;

    return (
        <div {...props}>
            <h5 className="sr-only">You said:</h5>

            <div
                className={cn(
                    "group/message w-ful flex flex-col justify-end gap-2",
                    classNameWrapper,
                )}
            >
                <div className="mb-2 space-y-4">
                    <ChatMessageUploadsFiles
                        parts={parts as UIFileMessagePart[]}
                        className="flex flex-col items-end gap-2"
                        classNameItem="max-w-74 w-full"
                    />
                    <ChatMessageUploadsImages
                        parts={parts as UIFileMessagePart[]}
                        className="flex justify-end gap-4"
                        classNameItem={isMultiple =>
                            isMultiple ? "aspect-square w-1/4" : "w-1/3"
                        }
                    />
                </div>

                {canShowPromptForm && (
                    <PromptComposer
                        variant="update"
                        value={content}
                        min={CHAT_CHARACTER_MIN_LIMIT}
                        max={CHAT_CHARACTER_MAX_LIMIT}
                        onCancel={() => setIsUpdating(false)}
                        onSubmit={text => {
                            handleUserRegenerate({
                                messageId: message.id,
                                newMessage: text,
                            });
                            setIsUpdating(false);
                        }}
                    />
                )}

                {canShowMessage && (
                    <div
                        className={cn(
                            "max-w-2/3 wrap-anywhere self-end text-pretty rounded-2xl bg-zinc-800 px-4 py-2.5 text-base leading-relaxed text-zinc-50",
                            isTruncated && "grid grid-cols-[1fr_auto] gap-2",
                            classNameContent,
                        )}
                    >
                        {isTruncated && !isExpanded
                            ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
                            : content}
                        {isTruncated && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full hover:bg-zinc-700"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <span className="sr-only">
                                    {isExpanded ? "Read less" : "Read more"}
                                </span>
                                {isExpanded ? (
                                    <IconChevronUp />
                                ) : (
                                    <IconChevronDown />
                                )}
                            </Button>
                        )}
                    </div>
                )}

                <ChatMessageToolbarUser
                    canShowActions={canShowActions}
                    status={status}
                    content={content}
                    parts={parts}
                    onUpdate={() => setIsUpdating(true)}
                />
            </div>
        </div>
    );
}

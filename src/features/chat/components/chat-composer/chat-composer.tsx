"use client";

import { memo } from "react";

import { ChatComposerFooter } from "@/features/chat/components/chat-composer-footer";
import { ChatComposerInfo } from "@/features/chat/components/chat-composer-info";

import { cn } from "@/lib/utils";

import { ChatComposerFiles } from "./chat-composer-files";
import { ChatComposerPrompt } from "./chat-composer-prompt";

type ChatComposerProps = {
    classNamePromptComposer?: string;
    classNameFilesPreview?: string;
} & Omit<React.ComponentProps<"div">, "children">;

const ChatComposer = ({
    className,
    classNamePromptComposer,
    classNameFilesPreview,
    ...props
}: ChatComposerProps) => {
    return (
        <div
            className={cn(
                "shadow-zinc-925 2lg:pr-[calc(var(--scrollbar-size)+1rem)] z-10 px-4 shadow-[0_-8px_40px_20px_rgba(0,0,0,0.1)]",
                className,
            )}
            data-testid="chat-composer"
            data-slot="chat-composer"
            {...props}
        >
            <div className="relative mx-auto w-full max-w-3xl pb-12">
                <div className="relative rounded-3xl">
                    <ChatComposerInfo />
                    <ChatComposerFiles className={classNameFilesPreview} />
                    <ChatComposerPrompt
                        className={cn("relative z-10", classNamePromptComposer)}
                    />
                    <div className="bg-zinc-925 absolute top-0 h-full w-full translate-y-1/2" />
                </div>
                <ChatComposerFooter />
            </div>
        </div>
    );
};

export const MemoizedChatComposer = memo(ChatComposer);

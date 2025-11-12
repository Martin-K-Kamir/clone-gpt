"use client";

import { useScrollPosition } from "@/hooks";
import { IconArrowDown } from "@tabler/icons-react";
import { ChatStatus } from "ai";
import React from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type ChatMessagesScrollBottomProps = {
    containerRef: React.RefObject<HTMLDivElement | null>;
    status: ChatStatus;
};

export function ChatMessagesScrollBottom({
    containerRef,
    status,
}: ChatMessagesScrollBottomProps) {
    const { isAtBottom } = useScrollPosition(containerRef, true);

    if (status === "streaming" || status === "submitted") {
        return null;
    }

    return (
        <div className="absolute bottom-10 left-1/2 z-50 mx-auto max-w-3xl -translate-x-1/2 -translate-y-[calc(var(--chat-composer-files-height,_0px)+var(--chat-composer-info-height,_0px))] transition-transform duration-300 ease-in-out">
            <Button
                variant="outline"
                size="icon"
                className={cn(
                    "size-8 rounded-full bg-zinc-800 transition-opacity duration-200 hover:bg-zinc-700",
                    isAtBottom
                        ? "pointer-events-none opacity-0"
                        : "opacity-100",
                )}
                onClick={() => {
                    containerRef?.current?.scrollTo({
                        top: containerRef?.current?.scrollHeight,
                        behavior: "smooth",
                    });
                }}
            >
                <span className="sr-only">Scroll to bottom</span>
                <IconArrowDown />
            </Button>
        </div>
    );
}

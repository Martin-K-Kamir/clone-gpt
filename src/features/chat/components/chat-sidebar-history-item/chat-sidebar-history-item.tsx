"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React, { memo, useRef } from "react";

import { useSidebarContext } from "@/components/ui/sidebar";

import {
    ChatItemDropdownMenu,
    ChatItemDropdownMenuTrigger,
} from "@/features/chat/components/chat-item-dropdown-menu";
import { useChatRename } from "@/features/chat/hooks";
import type { DBChatId, UIChat } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tags";

import { ChatSidebarHistoryItemInput } from "./chat-sidebar-history-item-input";
import { ChatSidebarHistoryItemLink } from "./chat-sidebar-history-item-link";

type ChatSidebarHistoryItemProps = {
    chatId: DBChatId;
    initialData?: UIChat;
    animate?: boolean;
    isActive: boolean;
    className?: string;
    classNameLink?: string;
    classNameInput?: string;
} & React.ComponentProps<typeof motion.li>;

export function ChatSidebarHistoryItem({
    chatId,
    initialData,
    isActive,
    className,
    classNameLink,
    classNameInput,
    animate = true,
    ...props
}: ChatSidebarHistoryItemProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setOpenMobile, isMobile } = useSidebarContext();

    const { data: chat } = useSuspenseQuery({
        initialData,
        queryKey: [tag.userChat(chatId)],
        queryFn: () => getUserChatById({ chatId }),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { optimisticTitle, isRenaming, startRenaming } = useChatRename({
        inputRef,
        chatId,
        title: chat.title,
    });

    if (!chat) {
        return null;
    }

    return (
        <motion.li
            layout
            initial={animate ? { opacity: 0, y: -20 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            exit={animate ? { opacity: 0, y: -20 } : undefined}
            transition={{ duration: 0.3, ease: "easeOut" }}
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={className}
            {...props}
        >
            {isRenaming && (
                <ChatSidebarHistoryItemInput
                    ref={el => {
                        el?.focus();
                        el?.select();
                        inputRef.current = el;
                    }}
                    defaultValue={optimisticTitle}
                    className={classNameInput}
                />
            )}
            {!isRenaming && (
                <ChatSidebarHistoryItemLink
                    href={`/chat/${chatId}`}
                    isActive={isActive}
                    className={classNameLink}
                    onClick={() => {
                        if (isMobile) {
                            setOpenMobile(false);
                        }
                    }}
                >
                    <span className="truncate">{optimisticTitle}</span>

                    <div
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <ChatItemDropdownMenu
                            chat={{
                                ...chat,
                                title: optimisticTitle,
                            }}
                            onRename={startRenaming}
                        >
                            <ChatItemDropdownMenuTrigger className="data-[state=open]:bg-transparent" />
                        </ChatItemDropdownMenu>
                    </div>
                </ChatSidebarHistoryItemLink>
            )}
        </motion.li>
    );
}

export const HardMemoChatSidebarHistoryItem = memo(
    ChatSidebarHistoryItem,
    (prev, next) => {
        return prev.chatId === next.chatId && prev.isActive === next.isActive;
    },
);

export const MemoChatSidebarHistoryItem = React.memo(ChatSidebarHistoryItem);

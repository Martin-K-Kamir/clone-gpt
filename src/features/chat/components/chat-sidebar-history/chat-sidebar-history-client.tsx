"use client";

import { AnimatePresence } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef } from "react";

import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";

import { HardMemoChatSidebarHistoryItem as ChatSidebarHistoryItem } from "@/features/chat/components/chat-sidebar-history-item";
import { useChatIdParam, useInfiniteUserChats } from "@/features/chat/hooks";
import {
    QUERY_USER_CHATS_LIMIT,
    QUERY_USER_CHATS_ORDER_BY,
} from "@/features/chat/lib/constants";
import { UIChat } from "@/features/chat/lib/types";
import { useChatSidebarContext } from "@/features/chat/providers";

import type { PaginatedData } from "@/lib/types";
import {
    cn,
    createGroupedItemCalculator,
    groupByTimePastPeriods,
} from "@/lib/utils";

import { usePrevious } from "@/hooks";

import { ChatSidebarHistoryEmpty } from "./chat-sidebar-history-empty";
import { ChatSidebarHistoryLabel } from "./chat-sidebar-history-label";
import { ChatSidebarItemsSkeleton } from "./chat-sidebar-history-skeleton";

const NEAR_END_ITEM_OFFSET = 8;

export type ChatSidebarHistoryClientProps = {
    initialData?: PaginatedData<UIChat[]>;
} & Omit<React.ComponentProps<typeof SidebarGroup>, "children">;

export function ChatSidebarHistoryClient({
    className,
    initialData,
    ...props
}: ChatSidebarHistoryClientProps) {
    const chatId = useChatIdParam();
    const chatItemRef = useRef<HTMLLIElement>(null);
    const sidebarGroupRef = useRef<HTMLDivElement>(null);
    const { setChatHistoryRef } = useChatSidebarContext();

    const { chats, hasNextPage } = useInfiniteUserChats(chatItemRef, {
        initialData,
        limit: QUERY_USER_CHATS_LIMIT,
        orderBy: QUERY_USER_CHATS_ORDER_BY,
    });

    useEffect(() => {
        if (!sidebarGroupRef.current) return;
        setChatHistoryRef(sidebarGroupRef);
    }, [setChatHistoryRef]);

    const timeGroupedChats = useMemo(() => {
        const sortedChats = chats.sort((a, b) => {
            return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
        });

        return Object.entries(
            groupByTimePastPeriods(sortedChats, chat => chat.updatedAt),
        ).map(([key, chats]) => {
            return {
                key,
                items: chats,
            };
        });
    }, [chats]);

    const calculateNearEndItem = useMemo(() => {
        return createGroupedItemCalculator(
            timeGroupedChats,
            chats.length,
            NEAR_END_ITEM_OFFSET,
        );
    }, [timeGroupedChats, chats.length]);

    const prevChatsLength = usePrevious(chats.length);
    const lengthChanged =
        prevChatsLength !== undefined && prevChatsLength !== chats.length;

    if (timeGroupedChats.length === 0) {
        return <ChatSidebarHistoryEmpty className={className} {...props} />;
    }

    return (
        <SidebarGroup
            className={cn("h-full", className)}
            {...props}
            ref={sidebarGroupRef}
        >
            <SidebarMenu className="gap-0">
                <AnimatePresence initial={false}>
                    {timeGroupedChats.map(({ key, items }, groupIndex) => {
                        return (
                            <Fragment key={key}>
                                <ChatSidebarHistoryLabel
                                    animate={!lengthChanged}
                                >
                                    {key}
                                </ChatSidebarHistoryLabel>

                                {items.map((chat, chatIndex) => {
                                    const { isNearEnd } = calculateNearEndItem(
                                        groupIndex,
                                        chatIndex,
                                    );

                                    return (
                                        <ChatSidebarHistoryItem
                                            ref={
                                                isNearEnd
                                                    ? chatItemRef
                                                    : undefined
                                            }
                                            key={chat.id}
                                            chatId={chat.id}
                                            initialData={chat}
                                            isActive={chat.id === chatId}
                                            animate={!lengthChanged}
                                        />
                                    );
                                })}
                            </Fragment>
                        );
                    })}
                </AnimatePresence>
            </SidebarMenu>

            {hasNextPage && <ChatSidebarItemsSkeleton length={6} />}
        </SidebarGroup>
    );
}

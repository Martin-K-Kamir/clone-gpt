"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
    DBChatId,
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";

import type {
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";

import { ChatViewBody } from "./chat-view-body";

type ChatViewBodyWrapperProps = {
    userId: DBUserId;
    isNewChat?: boolean;
    chatId: DBChatId;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    messages?: UIChatMessage[];
    userChatPreferences: DBUserChatPreferences | null;
};

export function ChatViewBodyWrapper(props: ChatViewBodyWrapperProps) {
    const pathname = usePathname();
    const [remountKey, setRemountKey] = useState(0);
    const prevPathnameRef = useRef(pathname);
    const prevChatIdRef = useRef(props.chatId);

    useEffect(() => {
        // Force remount when pathname changes to "/" or when chatId changes
        if (
            pathname === "/" &&
            (prevPathnameRef.current !== pathname ||
                prevChatIdRef.current !== props.chatId)
        ) {
            setRemountKey(prev => prev + 1);
        }
        prevPathnameRef.current = pathname;
        prevChatIdRef.current = props.chatId;
    }, [pathname, props.chatId]);

    return <ChatViewBody key={`${props.chatId}-${remountKey}`} {...props} />;
}

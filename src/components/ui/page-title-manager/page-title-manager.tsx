"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useChatIdParam } from "@/features/chat/hooks";
import { getUserChatById } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tag";

export function PageTitleManager() {
    const pathname = usePathname();
    const chatId = useChatIdParam();

    const { data: chat } = useQuery({
        queryKey: chatId ? [tag.userChat(chatId)] : ["no-chat"],
        queryFn: () => (chatId ? getUserChatById({ chatId }) : null),
        enabled: !!chatId,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (chatId) {
            if (chat?.title) {
                document.title = `${chat.title} · CloneGPT`;
            } else {
                document.title = "CloneGPT";
            }
        } else if (pathname === "/chat" || pathname === "/") {
            document.title = "CloneGPT";
        } else if (pathname === "/signin") {
            document.title = "Sign in | CloneGPT";
        } else if (pathname === "/signup") {
            document.title = "Sign up | CloneGPT";
        } else if (pathname === "/logout") {
            document.title = "Logged out | CloneGPT";
        } else {
            document.title = "CloneGPT";
        }
    }, [chatId, pathname, chat?.title]);

    return null;
}

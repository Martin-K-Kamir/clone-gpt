"use client";

import { usePathname } from "next/navigation";

import { getChatIdFromPathname } from "@/features/chat/lib/utils";

export function useChatIdParam() {
    const pathname = usePathname();
    const chatId = getChatIdFromPathname(pathname);
    return chatId;
}

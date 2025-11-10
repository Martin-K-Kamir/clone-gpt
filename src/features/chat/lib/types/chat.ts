import { CHAT_ROLES } from "@/features/chat/lib/constants";

export type ChatRole = (typeof CHAT_ROLES)[number];

export type ChatAccess = {
    allowed: boolean;
    chatFound: boolean;
    isOwner: boolean;
    isPrivate: boolean;
    isPublic: boolean;
};

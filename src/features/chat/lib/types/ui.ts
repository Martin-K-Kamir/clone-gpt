import type { DBChatId, DBChatVisibility } from "./db";

export type UIChat = {
    id: DBChatId;
    title: string;
    visibility: DBChatVisibility;
    createdAt: string;
    updatedAt: string;
    visibleAt: string;
};

export type UIChatSearchResult = {
    id: DBChatId;
    title: string;
    snippet?: string;
    createdAt: string;
    updatedAt: string;
};

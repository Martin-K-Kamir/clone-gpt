import type { DBUserId } from "@/features/user/lib/types";

import type { Brand, Tables } from "@/lib/types";

export type DBChatId = Brand<Tables<"chats">["id"], "chatId">;

export type DBChat = Omit<Tables<"chats">, "id" | "userId"> & {
    id: DBChatId;
    userId: DBUserId;
};

export type DBChatMessage = Omit<
    Tables<"messages">,
    "chatId" | "id" | "userId"
> & {
    id: DBChatMessageId;
    chatId: DBChatId;
    userId: DBUserId;
};
export type DBChatMessageRole = Tables<"messages">["role"];

export type DBChatVisibility = Tables<"chats">["visibility"];

export type DBChatSearchResult = DBChat & {
    snippet: string;
};

export type DBChatMessageId = Brand<Tables<"messages">["id"], "chatMessageId">;

export type DBUpdateChat = Partial<Omit<DBChat, "id">>;

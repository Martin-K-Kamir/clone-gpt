import type { Brand, Tables } from "@/lib/types";

export type DBUserId = Brand<Tables<"users">["id"], "userId">;

export type DBUser = Omit<Tables<"users">, "id"> & { id: DBUserId };

export type NewUser = Omit<DBUser, "id" | "createdAt" | "image" | "role"> & {
    image?: string | null;
    role?: DBUserRole;
};

export type DBUserRole = Tables<"users">["role"];

export type DBUserChatPreferences = Omit<
    Tables<"user_preferences">,
    "userId"
> & {
    userId: DBUserId;
};

export type DBUserMessagesRateLimit = Omit<
    Tables<"user_messages_rate_limits">,
    "userId"
> & {
    userId: DBUserId;
};

export type DBUserFilesRateLimit = Omit<
    Tables<"user_files_rate_limits">,
    "userId"
> & {
    userId: DBUserId;
};

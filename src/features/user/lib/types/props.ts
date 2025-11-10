import type { DBUserChatPreferences, DBUserId, DBUserRole } from "./db";

export type WithUserId = {
    userId: DBUserId;
};

export type WithEmail = {
    email: string;
};

export type WithUserRole = {
    userRole: DBUserRole;
};

export type WithUserChatPreferences = {
    userChatPreferences: DBUserChatPreferences;
};

export type WithPartialUserChatPreferences = {
    userChatPreferences: Partial<DBUserChatPreferences>;
};

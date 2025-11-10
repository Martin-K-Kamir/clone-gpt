import type { DBUserId, DBUserRole } from "./db";

export type UIUser = {
    id: DBUserId;
    name: string;
    email: string;
    image?: string | null;
    role: DBUserRole;
};

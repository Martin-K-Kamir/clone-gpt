import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { UserSidebarItemClient } from "./user-sidebar-item-client";

export async function UserSidebarItem() {
    const session = await auth();
    assertSessionExists(session);

    return (
        <UserSidebarItemClient
            key={`user-sidebar-item-${session.user.id}`}
            user={session.user}
        />
    );
}

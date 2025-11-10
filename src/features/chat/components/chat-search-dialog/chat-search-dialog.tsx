import { sub } from "date-fns";
import React from "react";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import { getUserChatsByDate } from "@/features/chat/services/db";

import { ORDER_BY } from "@/lib/constants";

import { ChatSearchDialogClient } from "./chat-search-dialog-client";

export async function ChatSearchDialog(
    props: Omit<
        React.ComponentProps<typeof ChatSearchDialogClient>,
        "initialData"
    >,
) {
    const session = await auth();
    assertSessionExists(session);

    let data;

    try {
        data = await getUserChatsByDate({
            userId: session.user.id,
            from: sub(new Date(), { days: 30 }),
            limit: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
            orderBy: ORDER_BY.UPDATED_AT,
        });
    } catch {}

    return <ChatSearchDialogClient initialData={data} {...props} />;
}

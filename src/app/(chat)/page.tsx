import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { ChatViewBody } from "@/features/chat/components/chat-view-body/chat-view-body";
import { ChatViewHeader } from "@/features/chat/components/chat-view-header";
import { assertIsDBChatId } from "@/features/chat/lib/asserts";

import { getUserChatPreferences } from "@/features/user/services/db";

export default async function Page() {
    const session = await auth();
    assertSessionExists(session);

    const userChatPreferences = await getUserChatPreferences({
        userId: session.user.id,
    });

    const chatId = crypto.randomUUID();
    assertIsDBChatId(chatId);

    return (
        <>
            <ChatViewHeader />
            <ChatViewBody
                isNewChat
                key={chatId}
                userId={session.user.id}
                chatId={chatId}
                userChatPreferences={userChatPreferences}
            />
        </>
    );
}

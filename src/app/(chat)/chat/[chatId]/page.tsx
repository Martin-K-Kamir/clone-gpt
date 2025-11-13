import type { Metadata } from "next";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { ChatViewBody } from "@/features/chat/components/chat-view-body/chat-view-body";
import { ChatViewHeader } from "@/features/chat/components/chat-view-header";
import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import {
    getUserChatById,
    getUserChatMessages,
} from "@/features/chat/services/db";

import { getUserChatPreferences } from "@/features/user/services/db";

type Props = {
    params: Promise<{ chatId: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { chatId } = await props.params;
    assertIsDBChatId(chatId);

    const session = await auth();
    assertSessionExists(session);

    try {
        const chat = await getUserChatById({
            chatId,
            userId: session.user.id,
            throwOnNotFound: false,
        });

        if (chat?.title) {
            return { title: `${chat.title} · CloneGPT` };
        }
    } catch (error) {
        console.error(error);
    }

    return { title: " as" };
}

export default async function Page(props: Props) {
    const { chatId } = await props.params;

    assertIsDBChatId(chatId);

    const session = await auth();
    assertSessionExists(session);

    const [chatMessages, userChatPreferences] = await Promise.all([
        getUserChatMessages({ chatId, userId: session.user.id }),
        getUserChatPreferences({ userId: session.user.id }),
    ]);

    return (
        <>
            <ChatViewHeader chatId={chatId} />

            <ChatViewBody
                chatId={chatId}
                userId={session.user.id}
                messages={chatMessages.data}
                visibility={chatMessages.visibility}
                isOwner={chatMessages.isOwner}
                userChatPreferences={userChatPreferences}
            />
        </>
    );
}

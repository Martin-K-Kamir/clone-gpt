import type { Metadata } from "next";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { ChatViewBodyWrapper as ChatViewBody } from "@/features/chat/components/chat-view-body";
import { ChatViewHeader } from "@/features/chat/components/chat-view-header";
import { assertIsDBChatId } from "@/features/chat/lib/asserts";

import { getUserChatPreferences } from "@/features/user/services/db";

export const preferredRegion = "fra1";

export const metadata: Metadata = {
    description:
        "Start a new conversation with CloneGPT. Ask questions, get help, and explore AI-powered assistance.",
};

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
                key={`chat-view-body-wrapper-${chatId}`}
                isNewChat
                userId={session.user.id}
                chatId={chatId}
                userChatPreferences={userChatPreferences}
            />
        </>
    );
}

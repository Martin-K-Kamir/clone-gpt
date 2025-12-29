import { AppProviders } from "#.storybook/lib/decorators/providers";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_CONVERSATION_BASIC,
    MOCK_CONVERSATION_COMPLEX,
    MOCK_CONVERSATION_LONG_SCROLLING,
    MOCK_CONVERSATION_PUBLIC,
    MOCK_CONVERSATION_WITH_GENERATED_FILE,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE,
    MOCK_CONVERSATION_WITH_MARKDOWN,
    MOCK_CONVERSATION_WITH_SINGLE_FILE,
    MOCK_CONVERSATION_WITH_SINGLE_IMAGE,
} from "#.storybook/lib/mocks/conversations";
import { createMockUserMessage } from "#.storybook/lib/mocks/messages";
import { MOCK_USER_ID, createMockUser } from "#.storybook/lib/mocks/users";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { ChatViewBody } from "./chat-view-body";

const mockUser = createMockUser();

const meta = preview.meta({
    component: ChatViewBody,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925 relative flex h-screen w-full flex-col overflow-hidden">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
        a11y: {
            config: {
                rules: [
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                ],
            },
        },
        provider: {
            user: mockUser,
        },
    },
    argTypes: {
        isOwner: {
            control: "boolean",
        },
        visibility: {
            control: "select",
            options: [CHAT_VISIBILITY.PRIVATE, CHAT_VISIBILITY.PUBLIC],
        },
        isNewChat: {
            control: "boolean",
        },
    },
});

export const Default = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: [],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

Default.test("should show greeting when no messages", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.getByText(/good (morning|afternoon|evening)/i);
        expect(greeting).toBeInTheDocument();
    });
});

Default.test("should render composer", async ({ canvas }) => {
    await waitFor(() => {
        const composer = canvas.getByRole("textbox");
        expect(composer).toBeInTheDocument();
    });
});

export const WithMessages = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_BASIC,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

WithMessages.test("should render messages", async ({ canvas }) => {
    await waitFor(() => {
        const messages = canvas.getAllByRole("article");
        expect(messages.length).toBeGreaterThan(0);
    });
});

export const WithLongConversation = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_LONG_SCROLLING,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const PublicChat = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_PUBLIC,
        isOwner: false,
        visibility: CHAT_VISIBILITY.PUBLIC,
        isNewChat: false,
        userChatPreferences: null,
    },
});

PublicChat.test(
    "should show public notice for non-owner",
    async ({ canvas }) => {
        await waitFor(() => {
            const notice = canvas.getByTestId("chat-composer-public-notice");
            expect(notice).toBeInTheDocument();
        });
    },
);

export const UserUploadsImage = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_WITH_SINGLE_IMAGE,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const UserUploadsFile = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_WITH_SINGLE_FILE,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const AssistantGeneratesImage = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_WITH_GENERATED_IMAGE,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const AssistantGeneratesFile = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_WITH_GENERATED_FILE,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const ComplexConversation = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_COMPLEX,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const WithMarkdown = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: MOCK_CONVERSATION_WITH_MARKDOWN,
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const WithFilesInComposer = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: [
            createMockUserMessage({ text: "I'm about to send some files" }),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const WithImagesInComposer = meta.story({
    args: {
        userId: MOCK_USER_ID,
        chatId: MOCK_CHAT_ID,
        messages: [],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

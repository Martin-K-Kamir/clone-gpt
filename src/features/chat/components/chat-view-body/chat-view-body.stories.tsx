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
import {
    MOCK_FILES_MIXED,
    createColoredImageFiles,
} from "#.storybook/lib/mocks/files";
import {
    MOCK_CHAT_STATUS,
    createMockUserMessage,
} from "#.storybook/lib/mocks/messages";
import { MOCK_USER_ID, createMockUser } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useEffect, useMemo, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type {
    DBChatId,
    DBChatVisibility,
    UIChatMessage,
} from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatFilesContext,
    ChatFilesRateLimitContext,
    ChatHandlersContext,
    ChatMessagesRateLimitContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
    ChatStatusContext,
} from "@/features/chat/providers";

import type {
    DBUserId,
    UIUser,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
    useUserSessionContext,
} from "@/features/user/providers";

import { ChatViewBody, ChatViewBodyContent } from "./chat-view-body";

const mockUser = createMockUser();

function UserSessionSetter({ user }: { user: UIUser }) {
    const { setUser } = useUserSessionContext();
    useEffect(() => {
        setUser(user);
    }, [setUser, user]);
    return null;
}

function ChatViewBodyWithFilesOverride({
    chatId,
    userId,
    isNewChat,
    isOwner,
    userChatPreferences,
    messages = [],
    visibility,
    filesContextValue,
    ...props
}: {
    chatId: DBChatId;
    userId: DBUserId;
    isNewChat?: boolean;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    messages?: UIChatMessage[];
    userChatPreferences: any;
    filesContextValue: {
        selectedFiles: File[];
        uploadedFiles: any[];
        isUploadingFiles: boolean;
        handleFileSelect: (files: File[]) => void;
        handleFileRemove: (file: File) => void;
    };
} & Omit<React.ComponentProps<"div">, "children">) {
    return (
        <ChatProvider
            userId={userId}
            isNewChat={isNewChat}
            isOwner={isOwner}
            chatId={chatId}
            messages={messages}
            userChatPreferences={userChatPreferences}
            visibility={visibility}
        >
            <ChatFilesContext.Provider value={filesContextValue}>
                <ChatViewBodyContent {...props} />
            </ChatFilesContext.Provider>
        </ChatProvider>
    );
}

const StoryWrapper = ({
    Story,
    status = MOCK_CHAT_STATUS.READY,
    messages = [],
    selectedFiles = [],
    isUploadingFiles = false,
    rateLimitMessages,
    rateLimitFiles,
    isOwner = true,
    visibility = CHAT_VISIBILITY.PRIVATE,
    isNewChat = false,
    userChatPreferences = null,
    userId,
    chatId,
}: {
    Story: React.ComponentType<any>;
    status?: ChatStatus;
    messages?: UIChatMessage[];
    selectedFiles?: File[];
    isUploadingFiles?: boolean;
    rateLimitMessages?: UserMessagesRateLimitResult;
    rateLimitFiles?: UserFilesRateLimitResult;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
    isNewChat?: boolean;
    userChatPreferences?: any;
    userId?: DBUserId;
    chatId?: DBChatId;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);
    const [files, setFiles] = useState<File[]>(selectedFiles);
    const [uploadedFiles] = useState<any[]>([]);

    useEffect(() => {
        setFiles(selectedFiles);
    }, [selectedFiles]);

    const chatFilesContextValue = useMemo(
        () => ({
            selectedFiles: files,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect: fn((newFiles: File[]) => {
                setFiles(prev => [...prev, ...newFiles]);
            }),
            handleFileRemove: fn((file: File) => {
                setFiles(prev => prev.filter(f => f !== file));
            }),
        }),
        [files, uploadedFiles, isUploadingFiles],
    );

    const chatHandlersContextValue = useMemo(
        () => ({
            handleSendMessage: fn(),
            handleStop: fn(),
            handleUserRegenerate: fn(),
            handleAssistantRegenerate: fn(),
        }),
        [],
    );

    const chatStatusContextValue = useMemo(
        () => ({
            status,
            error: undefined,
            isStreaming: status === MOCK_CHAT_STATUS.STREAMING,
            isSubmitted: status === MOCK_CHAT_STATUS.SUBMITTED,
            isReady: status === MOCK_CHAT_STATUS.READY,
            isError: status === MOCK_CHAT_STATUS.ERROR,
        }),
        [status],
    );

    const chatMessagesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitMessages,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitMessages],
    );

    const chatFilesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitFiles,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitFiles],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <UserSessionSetter user={mockUser} />
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatStatusContext.Provider
                                        value={chatStatusContextValue}
                                    >
                                        <ChatHandlersContext.Provider
                                            value={chatHandlersContextValue}
                                        >
                                            <ChatMessagesRateLimitContext.Provider
                                                value={
                                                    chatMessagesRateLimitContextValue
                                                }
                                            >
                                                <ChatFilesRateLimitContext.Provider
                                                    value={
                                                        chatFilesRateLimitContextValue
                                                    }
                                                >
                                                    <div className="bg-zinc-925 relative flex h-screen w-full flex-col overflow-hidden">
                                                        {selectedFiles.length >
                                                            0 &&
                                                        userId &&
                                                        chatId ? (
                                                            <ChatViewBodyWithFilesOverride
                                                                userId={userId}
                                                                chatId={chatId}
                                                                isNewChat={
                                                                    isNewChat
                                                                }
                                                                isOwner={
                                                                    isOwner
                                                                }
                                                                visibility={
                                                                    visibility
                                                                }
                                                                messages={
                                                                    messages
                                                                }
                                                                userChatPreferences={
                                                                    userChatPreferences
                                                                }
                                                                filesContextValue={
                                                                    chatFilesContextValue
                                                                }
                                                            />
                                                        ) : (
                                                            <Story />
                                                        )}
                                                    </div>
                                                </ChatFilesRateLimitContext.Provider>
                                            </ChatMessagesRateLimitContext.Provider>
                                        </ChatHandlersContext.Provider>
                                    </ChatStatusContext.Provider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: ChatViewBody,
    decorators: [
        (Story, context) => (
            <StoryWrapper
                Story={Story}
                status={context.args.status || MOCK_CHAT_STATUS.READY}
                messages={context.args.messages}
                isOwner={context.args.isOwner}
                visibility={context.args.visibility}
                isNewChat={context.args.isNewChat}
                userChatPreferences={context.args.userChatPreferences}
            />
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
    decorators: [
        (Story, context) => (
            <StoryWrapper
                Story={Story}
                status={MOCK_CHAT_STATUS.READY}
                messages={context.args.messages}
                selectedFiles={MOCK_FILES_MIXED}
                userId={context.args.userId}
                chatId={context.args.chatId}
                isOwner={context.args.isOwner}
                visibility={context.args.visibility}
                isNewChat={context.args.isNewChat}
                userChatPreferences={context.args.userChatPreferences}
            />
        ),
    ],
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
    decorators: [
        (Story, context) => (
            <StoryWrapper
                Story={Story}
                status={MOCK_CHAT_STATUS.READY}
                messages={context.args.messages}
                selectedFiles={createColoredImageFiles()}
                userId={context.args.userId}
                chatId={context.args.chatId}
                isOwner={context.args.isOwner}
                visibility={context.args.visibility}
                isNewChat={context.args.isNewChat}
                userChatPreferences={context.args.userChatPreferences}
            />
        ),
    ],
});

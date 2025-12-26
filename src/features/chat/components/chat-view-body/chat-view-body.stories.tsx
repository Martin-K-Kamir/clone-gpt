import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useEffect, useMemo, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    CHAT_MESSAGE_TYPE,
    CHAT_ROLE,
    CHAT_TOOL,
    CHAT_VISIBILITY,
} from "@/features/chat/lib/constants";
import type {
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    UIAssistantChatMessage,
    UIChatMessage,
    UIFileMessagePart,
    UIUserChatMessage,
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

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
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

const fixedDate = new Date("2025-12-22T12:00:00.000Z");
const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const mockMessageId = "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
const mockAssistantMessageId =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "test@example.com",
    role: USER_ROLE.USER,
    image: null,
};

const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";

function createMockUserMessage(
    text: string,
    messageId: DBChatMessageId = mockMessageId,
): UIUserChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: {
            role: CHAT_ROLE.USER,
            createdAt: FIXED_MESSAGE_DATE,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

function createMockAssistantMessage(
    text: string,
    messageId: DBChatMessageId = mockAssistantMessageId,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: FIXED_MESSAGE_DATE,
            model: "gpt-4",
            totalTokens: 100,
            isUpvoted: false,
            isDownvoted: false,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

function createMockUserMessageWithFiles(
    text: string,
    files: UIFileMessagePart[],
    messageId: DBChatMessageId = mockMessageId,
): UIUserChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: {
            role: CHAT_ROLE.USER,
            createdAt: FIXED_MESSAGE_DATE,
        },
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            ...files,
        ],
    };
}

function createMockAssistantMessageWithParts(
    parts: UIAssistantChatMessage["parts"],
    messageId: DBChatMessageId = mockAssistantMessageId,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: FIXED_MESSAGE_DATE,
            model: "gpt-4",
            totalTokens: 100,
            isUpvoted: false,
            isDownvoted: false,
        },
        parts,
    };
}

function createImageFileFromDataURL(
    dataURL: string,
    filename: string,
    mimeType: string,
): File {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function createColoredImageFile(
    color: string,
    filename: string,
    width: number = 100,
    height: number = 100,
): File {
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = width;
    imageCanvas.height = height;
    const ctx = imageCanvas.getContext("2d");
    if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
    const dataURL = imageCanvas.toDataURL("image/png");
    return createImageFileFromDataURL(dataURL, filename, "image/png");
}

const createImageFiles = () => {
    return [
        createColoredImageFile("#FF0000", "red.png"),
        createColoredImageFile("#0000FF", "blue.png"),
        createColoredImageFile("#00FF00", "green.png"),
    ];
};

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
        },
    });
}

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
    status = "ready",
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
            isStreaming: status === "streaming",
            isSubmitted: status === "submitted",
            isReady: status === "ready",
            isError: status === "error",
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

const periodEnd = new Date(
    fixedDate.getTime() + 24 * 60 * 60 * 1000,
).toISOString();

const meta = preview.meta({
    component: ChatViewBody,
    decorators: [
        (Story, context) => (
            <StoryWrapper
                Story={Story}
                status={context.args.status || "ready"}
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
        userId: mockUserId,
        chatId: mockChatId,
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
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Hello, how are you?"),
            createMockAssistantMessage("I'm doing well, thank you!"),
        ],
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
        userId: mockUserId,
        chatId: mockChatId,
        messages: Array.from({ length: 10 }, (_, i) => {
            if (i % 2 === 0) {
                return createMockUserMessage(
                    `User message ${i + 1}: This is a longer message to test scrolling behavior. `.repeat(
                        5,
                    ),
                );
            }
            return createMockAssistantMessage(
                `Assistant message ${i + 1}: This is a longer response to test scrolling behavior. `.repeat(
                    5,
                ),
            );
        }),
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const PublicChat = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Hello everyone!"),
            createMockAssistantMessage("Hello! How can I help?"),
        ],
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
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessageWithFiles("Check out this image:", [
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "photo.jpg",
                    url: "https://picsum.photos/id/239/800/600",
                    mediaType: "image/jpeg",
                    size: 1024 * 200,
                    extension: "jpg",
                    width: 800,
                    height: 600,
                },
            ]),
            createMockAssistantMessage(
                "That's a beautiful image! I can see it clearly.",
            ),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const UserUploadsFile = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessageWithFiles("Here's a document:", [
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "document.pdf",
                    url: "https://example.com/document.pdf",
                    mediaType: "application/pdf",
                    size: 1024 * 500,
                    extension: "pdf",
                },
            ]),
            createMockAssistantMessage(
                "I've received your document. Let me analyze it for you.",
            ),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const AssistantGeneratesImage = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Generate an image of a sunset"),
            createMockAssistantMessageWithParts([
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "I've generated an image for you:",
                },
                {
                    type: CHAT_TOOL.GENERATE_IMAGE,
                    toolCallId: "image-1",
                    state: "output-available",
                    input: {
                        prompt: "A beautiful sunset over mountains",
                        name: "sunset-mountains.jpg",
                        size: "1024x1024",
                    },
                    output: {
                        imageUrl: "https://picsum.photos/id/1015/800/600",
                        name: "sunset-mountains.jpg",
                        id: "00000000-0000-0000-0000-000000000010",
                        size: "1024x1024",
                    },
                },
            ]),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const AssistantGeneratesFile = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Create a Python script for me"),
            createMockAssistantMessageWithParts([
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "I've generated a file for you:",
                },
                {
                    type: CHAT_TOOL.GENERATE_FILE,
                    toolCallId: "file-1",
                    state: "output-available",
                    input: {
                        prompt: "Create a Python script",
                        filename: "script.py",
                    },
                    output: {
                        fileUrl: "https://example.com/generated/script.py",
                        name: "script.py",
                        extension: "py",
                        id: "00000000-0000-0000-0000-000000000020",
                        size: 1024 * 50,
                    },
                },
            ]),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const ComplexConversation = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Hello! Can you help me with something?"),
            createMockAssistantMessage(
                "Of course! I'd be happy to help. What do you need?",
            ),
            createMockUserMessageWithFiles("I have this image:", [
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "photo.jpg",
                    url: "https://picsum.photos/id/239/800/600",
                    mediaType: "image/jpeg",
                    size: 1024 * 200,
                    extension: "jpg",
                    width: 800,
                    height: 600,
                },
            ]),
            createMockAssistantMessage(
                "I can see the image. What would you like me to do with it?",
            ),
            createMockUserMessage("Can you generate a similar one?"),
            createMockAssistantMessageWithParts([
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "I've generated a similar image for you:",
                },
                {
                    type: CHAT_TOOL.GENERATE_IMAGE,
                    toolCallId: "image-1",
                    state: "output-available",
                    input: {
                        prompt: "A similar beautiful image",
                        name: "generated-image.jpg",
                        size: "1024x1024",
                    },
                    output: {
                        imageUrl: "https://picsum.photos/id/1015/800/600",
                        name: "generated-image.jpg",
                        id: "00000000-0000-0000-0000-000000000010",
                        size: "1024x1024",
                    },
                },
            ]),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const WithMarkdown = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [
            createMockUserMessage("Explain React hooks with examples"),
            createMockAssistantMessageWithParts([
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: `# React Hooks Explained

React Hooks are functions that let you use state and other React features in functional components.

## Common Hooks

### useState
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
\`\`\`javascript
useEffect(() => {
    // Side effect code
}, [dependencies]);
\`\`\`

## Benefits
- **Reusable logic**: Share stateful logic between components
- **Simpler components**: No need for class components
- **Better organization**: Related logic stays together`,
                },
            ]),
        ],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
});

export const WithFilesInComposer = meta.story({
    args: {
        userId: mockUserId,
        chatId: mockChatId,
        messages: [createMockUserMessage("I'm about to send some files")],
        isOwner: true,
        visibility: CHAT_VISIBILITY.PRIVATE,
        isNewChat: false,
        userChatPreferences: null,
    },
    decorators: [
        (Story, context) => (
            <StoryWrapper
                Story={Story}
                status="ready"
                messages={context.args.messages}
                selectedFiles={[
                    new File(["content"], "document.pdf", {
                        type: "application/pdf",
                    }),
                    new File(["content"], "button.tsx", {
                        type: "text/tsx",
                    }),
                    new File(["content"], "sum.js", {
                        type: "text/javascript",
                    }),
                ]}
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
        userId: mockUserId,
        chatId: mockChatId,
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
                status="ready"
                messages={context.args.messages}
                selectedFiles={createImageFiles()}
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

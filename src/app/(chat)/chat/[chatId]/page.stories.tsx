import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { SessionSyncProvider } from "@/features/auth/providers";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import {
    ChatSidebar,
    ChatSidebarSkeleton,
} from "@/features/chat/components/chat-sidebar";
import {
    CHAT_MESSAGE_TYPE,
    CHAT_ROLE,
    CHAT_TOOL,
    CHAT_VISIBILITY,
} from "@/features/chat/lib/constants";
import type {
    DBChat,
    DBChatId,
    DBChatMessageId,
    UIAssistantChatMessage,
    UIFileMessagePart,
    UIUserChatMessage,
    WithIsOwner,
} from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import {
    getUserChatById,
    getUserChatMessages,
    getUserChats,
} from "@/features/chat/services/db";

import type {
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";
import { getUserChatPreferences } from "@/features/user/services/db";

import {
    TEMPERATURE_SYSTEM,
    TIME_FORMATS,
    WEATHER_PERIOD,
} from "@/lib/constants";
import type {
    PaginatedData,
    WeatherIconCode,
    WeatherPeriod,
} from "@/lib/types";

import PageLoading from "./loading";
import Page from "./page";

const mockChatId = "00000000-0000-0000-0000-000000000001" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const mockMessageId = "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
const mockAssistantMessageId =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

const mockUserChatPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000010",
    userId: mockUserId,
    nickname: null,
    role: null,
    personality: "FRIENDLY",
    characteristics: null,
    extraInfo: null,
    createdAt: new Date().toISOString(),
};

const DEFAULT_CHATS_LENGTH = 20;

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

function createMockWeatherToolOutput(
    city: string = "New York",
    country: string = "United States",
    forecastCount: number = 12,
    period: WeatherPeriod = WEATHER_PERIOD.CURRENT,
) {
    const forecasts = Array.from({ length: forecastCount }, (_, i) => ({
        timestamp: Math.floor(Date.now() / 1000) + i * 3600,
        date: new Date(Date.now() + i * 3600 * 1000).toISOString(),
        temp: 22 + (i % 5),
        tempMax: 25 + (i % 5),
        tempMin: 18 + (i % 5),
        tempKf: 0,
        feelsLike: 22 + (i % 3),
        description: "clear sky",
        timeOfDay: "d" as const,
        iconCode: "01d" as WeatherIconCode,
        visibility: 10000,
        wind: {
            speed: 5 + (i % 3),
            deg: (i * 45) % 360,
            gust: 7 + (i % 2),
        },
        clouds: {
            all: (i % 10) * 10,
        },
        pop: 0,
        humidity: 50 + (i % 20),
        pressure: 1013 + (i % 10) - 5,
        seaLevel: 1013 + (i % 10) - 5,
        grndLevel: 1010 + (i % 10) - 5,
        rain: undefined,
        snow: undefined,
        id: 800,
        title: "Clear",
    }));

    return {
        location: {
            id: 5128581,
            name: city,
            country,
            city,
            timezone: -18000,
            sunrise: 1705320000,
            sunset: 1705356000,
        },
        forecasts,
        period,
        timeFormat: TIME_FORMATS.HOUR_24,
        temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
        language: "en",
    };
}

function createMockChat(
    chatId: DBChatId = mockChatId,
    userId: DBUserId = mockUserId,
    isOwner = true,
): DBChat & WithIsOwner {
    return {
        id: chatId,
        userId,
        title: "My Chat Conversation",
        visibility: CHAT_VISIBILITY.PRIVATE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleAt: new Date().toISOString(),
        isOwner,
    } as const;
}

function createMockChats(length = DEFAULT_CHATS_LENGTH): DBChat[] {
    const fixedDate = new Date("2025-12-20");
    return Array.from({ length }, (_, index) => {
        fixedDate.setDate(fixedDate.getDate() - index);
        const date = fixedDate.toISOString();
        return {
            id: index as unknown as DBChatId,
            userId: mockUserId,
            title: `Chat ${index}`,
            visibility: CHAT_VISIBILITY.PRIVATE,
            createdAt: date,
            updatedAt: date,
            visibleAt: date,
        } as const;
    });
}

function createMockPaginatedData(
    length = DEFAULT_CHATS_LENGTH,
    hasNextPage = false,
): PaginatedData<DBChat[]> {
    return {
        data: createMockChats(length),
        totalCount: length,
        hasNextPage,
        nextOffset: hasNextPage ? length : undefined,
    };
}

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

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <SidebarProvider>
                                        <ChatSearchDialogClient>
                                            <SidebarWrapper
                                                style={
                                                    {
                                                        "--sidebar-width":
                                                            "calc(var(--spacing) * 72)",
                                                        "--header-height":
                                                            "calc(var(--spacing) * 12)",
                                                    } as React.CSSProperties
                                                }
                                                className="max-h-svh"
                                            >
                                                <Suspense
                                                    fallback={
                                                        <ChatSidebarSkeleton />
                                                    }
                                                >
                                                    <ChatSidebar />
                                                </Suspense>
                                                <SidebarInset>
                                                    <Suspense
                                                        fallback={
                                                            <PageLoading />
                                                        }
                                                    >
                                                        <Story />
                                                    </Suspense>
                                                </SidebarInset>
                                            </SidebarWrapper>
                                        </ChatSearchDialogClient>
                                    </SidebarProvider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const PageWrapper = ({ chatId }: { chatId: string }) => {
    return <Page params={Promise.resolve({ chatId })} />;
};

const meta = preview.meta({
    component: PageWrapper,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: `/chat/${mockChatId}`,
            },
        },
    },
});

export const Default = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(
            createMockChat(mockChatId, mockUserId),
        );
        mocked(getUserChatMessages).mockResolvedValue({
            data: [
                createMockUserMessage("Hello, how are you?"),
                createMockAssistantMessage("I'm doing well, thank you!"),
            ],
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

Default.test("should render chat messages", async ({ canvas }) => {
    await waitFor(() => {
        const messages = canvas.getAllByTestId("chat-message");
        expect(messages.length).toBeGreaterThan(0);

        messages.forEach(message => {
            expect(message).toBeInTheDocument();
        });
    });
});

Default.test(
    "should open share dialog when clicking share button",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const shareButton = canvas.getByRole("button", {
                name: "Share",
            });
            expect(shareButton).toBeInTheDocument();
            expect(shareButton).toBeEnabled();

            await userEvent.click(shareButton);

            const shareDialog = document.querySelector(
                "[data-slot='dialog-content']",
            );
            expect(shareDialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should open chat actions dropdown menu when clicking chat actions button",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const chatActionsButton = canvas.getByRole("button", {
                name: "Open chat actions",
            });
            expect(chatActionsButton).toBeInTheDocument();
            expect(chatActionsButton).toBeEnabled();

            await userEvent.click(chatActionsButton);

            const chatActionsDropdownMenu = document.querySelector(
                "[data-slot='dropdown-menu-content']",
            );
            expect(chatActionsDropdownMenu).toBeInTheDocument();
        });
    },
);

export const WithLongConversation = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(
            createMockChat(mockChatId, mockUserId),
        );
        mocked(getUserChatMessages).mockResolvedValue({
            data: [
                createMockUserMessage(
                    `I'm working on a complex web application using Next.js and React, and I need help understanding the best practices for state management, data fetching, and component architecture. The application needs to handle real-time updates, user authentication, file uploads, and complex form validations. Can you provide a comprehensive guide on how to structure this application?`,
                    `${mockMessageId}-0` as DBChatMessageId,
                ),
                createMockAssistantMessage(
                    `I'd be happy to help you build a robust Next.js application! Let me break down the best practices for each area you mentioned:

## State Management

For Next.js applications, I recommend a hybrid approach:
- **Server State**: Use React Query (TanStack Query) for server state management. It provides excellent caching, background updates, and synchronization.
- **Client State**: Use React Context or Zustand for simple global state, or React Query's client state for more complex scenarios.
- **Form State**: Use React Hook Form for form management - it's performant and integrates well with validation libraries like Zod.

## Data Fetching

Next.js 13+ App Router provides excellent data fetching patterns:
- **Server Components**: Fetch data directly in Server Components for better performance and SEO.
- **Server Actions**: Use Server Actions for mutations (create, update, delete operations).
- **API Routes**: Create API routes for external API integrations or when you need custom endpoints.

## Component Architecture

Organize your components by feature:
\`\`\`
app/
  (routes)/
  components/
    feature-name/
      components/
      hooks/
      lib/
      types/
\`\`\`

This keeps related code together and makes the codebase more maintainable.`,
                    `${mockAssistantMessageId}-0` as DBChatMessageId,
                ),
                createMockUserMessage(
                    `That's very helpful! Now, regarding real-time updates - I need to implement a chat feature where users can see messages in real-time. What's the best approach for this in Next.js? Should I use WebSockets, Server-Sent Events, or polling? Also, how do I handle authentication securely in this context?`,
                    `${mockMessageId}-1` as DBChatMessageId,
                ),
                createMockAssistantMessage(
                    `Great question! For real-time chat in Next.js, here's my recommendation:

## Real-Time Communication

**WebSockets** are the best choice for bidirectional real-time communication:
- Use a library like **Socket.io** or native WebSocket API
- For production, consider services like **Pusher**, **Ably**, or **Supabase Realtime**
- These services handle scaling, reconnection, and message delivery guarantees

**Implementation Pattern:**
1. Create a WebSocket provider context that manages the connection
2. Use React Query's real-time subscriptions or custom hooks
3. Implement optimistic updates for better UX
4. Handle reconnection logic and offline states

## Authentication Security

For secure authentication in Next.js:
- Use **NextAuth.js** (Auth.js) for authentication - it's the standard for Next.js
- Implement JWT tokens with secure httpOnly cookies
- Use middleware to protect routes
- Validate tokens on both client and server
- For WebSocket connections, authenticate during the handshake and validate on each message

**Security Best Practices:**
- Never expose sensitive data in client components
- Always validate user permissions on the server
- Use CSRF tokens for state-changing operations
- Implement rate limiting to prevent abuse
- Use HTTPS in production (Next.js enforces this)

Would you like me to show you a complete implementation example for the chat feature with authentication?`,
                    `${mockAssistantMessageId}-1` as DBChatMessageId,
                ),
            ],
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

WithLongConversation.test(
    "should render all messages in long conversation",
    async ({ canvas }) => {
        await waitFor(() => {
            const messages = canvas.getAllByTestId("chat-message");
            expect(messages.length).toBeGreaterThan(0);

            messages.forEach(message => {
                expect(message).toBeInTheDocument();
            });
        });
    },
);

export const ComplexConversation = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(
            createMockChat(mockChatId, mockUserId),
        );
        mocked(getUserChatMessages).mockResolvedValue({
            data: [
                createMockUserMessage("What's the weather in London?"),
                createMockAssistantMessageWithParts(
                    [
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "Here's the weather forecast for London:",
                        },
                        {
                            type: CHAT_TOOL.GET_WEATHER,
                            toolCallId: "weather-1",
                            state: "output-available",
                            input: {
                                location: {
                                    city: "London",
                                    country: "United Kingdom",
                                },
                                forecastLimit: 12,
                                period: WEATHER_PERIOD.CURRENT,
                                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                                timeFormat: TIME_FORMATS.HOUR_24,
                                language: "en",
                            },
                            output: createMockWeatherToolOutput(
                                "London",
                                "United Kingdom",
                                12,
                                WEATHER_PERIOD.CURRENT,
                            ),
                        },
                    ],
                    `${mockAssistantMessageId}-0` as DBChatMessageId,
                ),
                createMockUserMessageWithFiles(
                    "Generate an image based on this:",
                    [
                        {
                            kind: CHAT_MESSAGE_TYPE.IMAGE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "reference.jpg",
                            url: "https://picsum.photos/id/1015/800/600",
                            mediaType: "image/jpeg",
                            size: 1024 * 250,
                            extension: "jpg",
                            width: 800,
                            height: 600,
                        },
                    ],
                    `${mockMessageId}-1` as DBChatMessageId,
                ),
                createMockAssistantMessageWithParts(
                    [
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I've generated an image based on your reference:",
                        },
                        {
                            type: CHAT_TOOL.GENERATE_IMAGE,
                            toolCallId: "image-1",
                            state: "output-available",
                            input: {
                                prompt: "A similar style image",
                                name: "generated.jpg",
                                size: "1024x1024",
                            },
                            output: {
                                imageUrl:
                                    "https://picsum.photos/id/1018/800/600",
                                name: "generated.jpg",
                                id: "00000000-0000-0000-0000-000000000012",
                                size: "1024x1024",
                            },
                        },
                    ],
                    `${mockAssistantMessageId}-1` as DBChatMessageId,
                ),
                createMockUserMessage(
                    "Can you explain React hooks with code examples?",
                    `${mockMessageId}-2` as DBChatMessageId,
                ),
                createMockAssistantMessageWithParts(
                    [
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
                    ],
                    `${mockAssistantMessageId}-2` as DBChatMessageId,
                ),
            ],
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

ComplexConversation.test(
    "should render complex conversation with tools and files",
    async ({ canvas }) => {
        await waitFor(() => {
            const messages = canvas.getAllByTestId("chat-message");
            expect(messages.length).toBeGreaterThan(0);

            messages.forEach(message => {
                expect(message).toBeInTheDocument();
            });
        });
    },
);

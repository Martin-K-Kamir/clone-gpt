import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    CHAT_MESSAGE_TYPE,
    CHAT_ROLE,
    CHAT_TOOL,
} from "@/features/chat/lib/constants";
import type {
    DBChatId,
    DBChatMessageId,
    UIAssistantChatMessage,
    UIChatMessage,
    UIFileMessagePart,
    UIUserChatMessage,
} from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
    ChatStatusContext,
} from "@/features/chat/providers";

import type { DBUserId } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import {
    TEMPERATURE_SYSTEM,
    TIME_FORMATS,
    TIME_OF_DAY,
    WEATHER_PERIOD,
} from "@/lib/constants";
import type { WeatherIconCode, WeatherPeriod } from "@/lib/types";

import { ChatMessages } from "./chat-messages";

const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const mockMessageId = "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
const mockAssistantMessageId =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";
const FIXED_WEATHER_START_DATE = new Date("2024-01-15T12:00:00Z");
const FIXED_SUNRISE_TIMESTAMP = 1705320000;
const FIXED_SUNSET_TIMESTAMP = 1705356000;

type WeatherForecastItem = {
    timestamp: number;
    date: string;
    temp: number;
    tempMax: number;
    tempMin: number;
    tempKf: number;
    feelsLike: number;
    description: string;
    timeOfDay: "d" | "n";
    iconCode: WeatherIconCode;
    visibility: number;
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    clouds: {
        all: number;
    };
    pop: number;
    humidity: number;
    pressure: number;
    seaLevel: number;
    grndLevel: number;
    rain: { "3h": number } | undefined;
    snow: { "3h": number } | undefined;
    id: number;
    title: string;
};

function createMockWeatherForecasts(
    count: number,
    period: WeatherPeriod = WEATHER_PERIOD.CURRENT,
    startDate: Date = FIXED_WEATHER_START_DATE,
): WeatherForecastItem[] {
    const forecasts: WeatherForecastItem[] = [];
    const descriptions = [
        "clear sky",
        "few clouds",
        "scattered clouds",
        "broken clouds",
        "shower rain",
        "rain",
        "thunderstorm",
        "snow",
        "mist",
    ];
    const weatherTitles = [
        "Clear",
        "Clouds",
        "Clouds",
        "Clouds",
        "Rain",
        "Rain",
        "Thunderstorm",
        "Snow",
        "Mist",
    ];
    const iconCodes = [
        "01d",
        "02d",
        "03d",
        "04d",
        "09d",
        "10d",
        "11d",
        "13d",
        "50d",
    ] as const;
    const weatherIds = [800, 801, 802, 803, 520, 500, 200, 600, 701];

    const getTemperature = (index: number): number => {
        const baseTemp = 22;
        const variation = Math.sin((index / count) * Math.PI * 2) * 5;
        return Math.round((baseTemp + variation) * 10) / 10;
    };

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        if (period === WEATHER_PERIOD.CURRENT) {
            date.setHours(date.getHours() + i);
        } else {
            date.setDate(date.getDate() + i);
            date.setHours(12, 0, 0, 0);
        }

        const temp = getTemperature(i);
        const tempVariation = (i % 5) + 2;
        const tempMax = Math.round((temp + tempVariation) * 10) / 10;
        const tempMin = Math.round((temp - tempVariation) * 10) / 10;

        const description = descriptions[i % descriptions.length];
        const iconCode = iconCodes[i % iconCodes.length];
        const timeOfDay =
            date.getHours() >= 6 && date.getHours() < 18
                ? TIME_OF_DAY.DAY
                : TIME_OF_DAY.NIGHT;

        const finalIconCode = iconCode.replace(
            /[dn]$/,
            timeOfDay,
        ) as WeatherIconCode;

        const weatherIndex = i % descriptions.length;
        const hasPrecipitation = weatherIndex >= 4 && weatherIndex <= 6;

        forecasts.push({
            timestamp: Math.floor(date.getTime() / 1000),
            date: date.toISOString(),
            temp,
            tempMax,
            tempMin,
            tempKf: 0,
            feelsLike: temp + (i % 3) - 1,
            description,
            timeOfDay,
            iconCode: finalIconCode,
            visibility: 10000 - (i % 3) * 1000,
            wind: {
                speed: 5 + (i % 5),
                deg: (i * 45) % 360,
                gust: 7 + (i % 3),
            },
            clouds: {
                all: (i % 10) * 10,
            },
            pop: hasPrecipitation ? (i % 5) * 20 : 0,
            humidity: 50 + (i % 20),
            pressure: 1013 + (i % 10) - 5,
            seaLevel: 1013 + (i % 10) - 5,
            grndLevel: 1010 + (i % 10) - 5,
            rain:
                hasPrecipitation && weatherIndex === 4
                    ? { "3h": (i % 5) * 2 }
                    : undefined,
            snow:
                hasPrecipitation && weatherIndex === 7
                    ? { "3h": (i % 3) * 1 }
                    : undefined,
            id: weatherIds[weatherIndex],
            title: weatherTitles[weatherIndex],
        });
    }

    return forecasts;
}

function createMockWeatherLocation(
    city: string = "New York",
    country: string = "United States",
) {
    return {
        id: 5128581,
        name: city,
        country,
        city,
        timezone: -18000,
        sunrise: FIXED_SUNRISE_TIMESTAMP,
        sunset: FIXED_SUNSET_TIMESTAMP,
    };
}

function createMockWeatherToolOutput(
    city: string = "New York",
    country: string = "United States",
    forecastCount: number = 12,
    period: WeatherPeriod = WEATHER_PERIOD.CURRENT,
) {
    return {
        location: createMockWeatherLocation(city, country),
        forecasts: createMockWeatherForecasts(
            forecastCount,
            period,
            FIXED_WEATHER_START_DATE,
        ),
        period,
        timeFormat: TIME_FORMATS.HOUR_24,
        temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
        language: "en",
    };
}

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

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60 * 1000,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            },
        },
    });
}

const StoryWrapper = ({
    Story,
    messages = [],
    chatId = mockChatId,
    status,
    error,
}: {
    Story: React.ComponentType;
    messages?: UIChatMessage[];
    chatId?: DBChatId;
    status?: ChatStatus;
    error?: Error;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    const chatStatusContextValue = useMemo(
        () =>
            status !== undefined
                ? {
                      status,
                      error,
                      isStreaming: status === "streaming",
                      isSubmitted: status === "submitted",
                      isReady: status === "ready",
                      isError: status === "error",
                  }
                : undefined,
        [status, error],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={mockUserId}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={chatId}
                                        messages={messages}
                                        userChatPreferences={null}
                                    >
                                        {chatStatusContextValue ? (
                                            <ChatStatusContext.Provider
                                                value={chatStatusContextValue}
                                            >
                                                <div className="h-screen w-full bg-zinc-950">
                                                    <Story />
                                                </div>
                                            </ChatStatusContext.Provider>
                                        ) : (
                                            <div className="h-screen w-full bg-zinc-950">
                                                <Story />
                                            </div>
                                        )}
                                    </ChatProvider>
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
    component: ChatMessages,
    decorators: [Story => <StoryWrapper Story={Story} />],
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
});

export const Default = meta.story({
    name: "Empty (Default)",
});

export const WithMessages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("Hello, how can you help me?"),
                    createMockAssistantMessage(
                        "Hello! I'm here to help you. How can I assist you today?",
                    ),
                ]}
            />
        ),
    ],
});

WithMessages.test(
    "should display user and assistant messages",
    async ({ canvas }) => {
        await waitFor(() => {
            const userMessage = canvas.getByText(
                /hello, how can you help me\?/i,
            );
            const assistantMessage = canvas.getByText(
                /hello! i'm here to help you\./i,
            );

            expect(userMessage).toBeInTheDocument();
            expect(assistantMessage).toBeInTheDocument();
        });
    },
);

WithMessages.test(
    "should render messages in correct order",
    async ({ canvas }) => {
        await waitFor(() => {
            const articles = canvas.getAllByRole("article");
            expect(articles.length).toBe(2);
            expect(articles[0]).toHaveAttribute("data-role", "user");
            expect(articles[1]).toHaveAttribute("data-role", "assistant");
        });
    },
);

export const WithMultipleMessages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("What is React?"),
                    createMockAssistantMessage(
                        "React is a JavaScript library for building user interfaces.",
                    ),
                    createMockUserMessage("How does it work?"),
                    createMockAssistantMessage(
                        "React uses a virtual DOM to efficiently update the UI.",
                    ),
                    createMockUserMessage("Can you give me an example?"),
                    createMockAssistantMessage(
                        "Sure! Here's a simple React component example...",
                    ),
                ]}
            />
        ),
    ],
});

WithMultipleMessages.test("should render all messages", async ({ canvas }) => {
    await waitFor(() => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(6);
    });
});

export const WithLongConversation = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                ]}
            />
        ),
    ],
});

WithLongConversation.test("should render all messages", async ({ canvas }) => {
    await waitFor(() => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(4);
    });
});

WithLongConversation.test(
    "should scroll to bottom on first render",
    async ({ canvas }) => {
        // Find the scrollable container
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for auto-scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // Allow small margin for rounding

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );
    },
);

WithLongConversation.test(
    "should show scroll bottom button when scrolled up",
    async ({ canvas, userEvent }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll event to process
        await waitFor(() => {
            const scrollButton = canvas.getByRole("button", {
                name: /scroll to bottom/i,
            });
            expect(scrollButton).toBeInTheDocument();
            expect(scrollButton).toBeVisible();
        });
    },
);

WithLongConversation.test(
    "should scroll to bottom when scroll bottom button is clicked",
    async ({ canvas, userEvent }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll button to appear and be clickable
        // The button has pointer-events-none when isAtBottom is true
        // We need to wait for useScrollPosition to update
        const scrollButton = await waitFor(
            () => {
                const button = canvas.getByRole("button", {
                    name: /scroll to bottom/i,
                });
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                // Check that pointer-events is not 'none'
                const computedStyle = window.getComputedStyle(button);
                expect(computedStyle.pointerEvents).not.toBe("none");
                expect(computedStyle.opacity).not.toBe("0");

                return button;
            },
            { timeout: 2000 },
        );

        // Click the scroll bottom button
        await userEvent.click(scrollButton);

        // Wait for smooth scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Button should be hidden again
        await waitFor(() => {
            const scrollButtonAfter = canvas.queryByRole("button", {
                name: /scroll to bottom/i,
            });
            // Button might still be in DOM but hidden with opacity-0
            if (scrollButtonAfter) {
                const computedStyle =
                    window.getComputedStyle(scrollButtonAfter);
                expect(computedStyle.opacity).toBe("0");
            }
        });
    },
);

export const UserWithSingleImage = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                ]}
            />
        ),
    ],
});

export const UserWithSingleFile = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                ]}
            />
        ),
    ],
});

export const UserWithMultipleImages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessageWithFiles("Here are some photos:", [
                        {
                            kind: CHAT_MESSAGE_TYPE.IMAGE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "photo1.jpg",
                            url: "https://picsum.photos/id/239/800/600",
                            mediaType: "image/jpeg",
                            size: 1024 * 200,
                            extension: "jpg",
                            width: 800,
                            height: 600,
                        },
                        {
                            kind: CHAT_MESSAGE_TYPE.IMAGE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "photo2.jpg",
                            url: "https://picsum.photos/id/240/800/600",
                            mediaType: "image/jpeg",
                            size: 1024 * 180,
                            extension: "jpg",
                            width: 800,
                            height: 600,
                        },
                        {
                            kind: CHAT_MESSAGE_TYPE.IMAGE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "photo3.jpg",
                            url: "https://picsum.photos/id/241/800/600",
                            mediaType: "image/jpeg",
                            size: 1024 * 220,
                            extension: "jpg",
                            width: 800,
                            height: 600,
                        },
                    ]),
                    createMockAssistantMessage(
                        "I can see all three images. They look great!",
                    ),
                ]}
            />
        ),
    ],
});

export const UserWithMultipleFiles = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessageWithFiles("Here are some documents:", [
                        {
                            kind: CHAT_MESSAGE_TYPE.FILE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "document1.pdf",
                            url: "https://example.com/document1.pdf",
                            mediaType: "application/pdf",
                            size: 1024 * 500,
                            extension: "pdf",
                        },
                        {
                            kind: CHAT_MESSAGE_TYPE.FILE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "document2.pdf",
                            url: "https://example.com/document2.pdf",
                            mediaType: "application/pdf",
                            size: 1024 * 600,
                            extension: "pdf",
                        },
                        {
                            kind: CHAT_MESSAGE_TYPE.FILE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "notes.txt",
                            url: "https://example.com/notes.txt",
                            mediaType: "text/plain",
                            size: 1024 * 10,
                            extension: "txt",
                        },
                    ]),
                    createMockAssistantMessage(
                        "I've received all your documents. Let me review them.",
                    ),
                ]}
            />
        ),
    ],
});

export const AssistantWithWeather = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("What's the weather in New York?"),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "Here's the weather forecast for New York:",
                        },
                        {
                            type: CHAT_TOOL.GET_WEATHER,
                            toolCallId: "weather-1",
                            state: "output-available",
                            input: {
                                location: {
                                    city: "New York",
                                    country: "United States",
                                },
                                forecastLimit: 24,
                                period: WEATHER_PERIOD.CURRENT,
                                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                                timeFormat: TIME_FORMATS.HOUR_24,
                                language: "en",
                            },
                            output: createMockWeatherToolOutput(
                                "New York",
                                "United States",
                                24,
                                WEATHER_PERIOD.CURRENT,
                            ),
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedImage = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                                imageUrl:
                                    "https://picsum.photos/id/1015/800/600",
                                name: "sunset-mountains.jpg",
                                id: "00000000-0000-0000-0000-000000000010",
                                size: "1024x1024",
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedImagePortrait = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("Generate a portrait image"),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I've generated a portrait image for you:",
                        },
                        {
                            type: CHAT_TOOL.GENERATE_IMAGE,
                            toolCallId: "image-1",
                            state: "output-available",
                            input: {
                                prompt: "A beautiful portrait of a landscape",
                                name: "portrait-image.jpg",
                                size: "1024x1792",
                            },
                            output: {
                                imageUrl:
                                    "https://picsum.photos/id/1020/1024/1792",
                                name: "portrait-image.jpg",
                                id: "00000000-0000-0000-0000-000000000014",
                                size: "1024x1792",
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedImageLandscape = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("Generate a landscape image"),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I've generated a landscape image for you:",
                        },
                        {
                            type: CHAT_TOOL.GENERATE_IMAGE,
                            toolCallId: "image-1",
                            state: "output-available",
                            input: {
                                prompt: "A beautiful wide landscape view",
                                name: "landscape-image.jpg",
                                size: "1792x1024",
                            },
                            output: {
                                imageUrl:
                                    "https://picsum.photos/id/1018/1792/1024",
                                name: "landscape-image.jpg",
                                id: "00000000-0000-0000-0000-000000000015",
                                size: "1792x1024",
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedImages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("Generate some images for me"),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I've generated some images for you:",
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
                                imageUrl:
                                    "https://picsum.photos/id/1015/800/600",
                                name: "sunset-mountains.jpg",
                                id: "00000000-0000-0000-0000-000000000010",
                                size: "1024x1024",
                            },
                        },
                        {
                            type: CHAT_TOOL.GENERATE_IMAGE,
                            toolCallId: "image-2",
                            state: "output-available",
                            input: {
                                prompt: "A beautiful sunrise over mountains",
                                name: "sunrise-mountains.jpg",
                                size: "1024x1024",
                            },
                            output: {
                                imageUrl:
                                    "https://picsum.photos/id/1016/800/600",
                                name: "sunrise-mountains.jpg",
                                id: "00000000-0000-0000-0000-000000000010",
                                size: "1024x1024",
                            },
                        },
                        {
                            type: CHAT_TOOL.GENERATE_IMAGE,
                            toolCallId: "image-3",
                            state: "output-available",
                            input: {
                                prompt: "A beautiful sunset over the ocean",
                                name: "sunset-ocean.jpg",
                                size: "1024x1024",
                            },
                            output: {
                                imageUrl:
                                    "https://picsum.photos/id/1018/800/600",
                                name: "sunset-ocean.jpg",
                                id: "00000000-0000-0000-0000-000000000013",
                                size: "1024x1024",
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedFile = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                                fileUrl:
                                    "https://example.com/generated-script.py",
                                name: "generated-script.py",
                                extension: "py",
                                id: "00000000-0000-0000-0000-000000000011",
                                size: 1024 * 5,
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithGeneratedFiles = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("Create some files for me"),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I've generated some files for you:",
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
                                fileUrl:
                                    "https://example.com/generated-script.py",
                                name: "generated-script.py",
                                extension: "py",
                                id: "00000000-0000-0000-0000-000000000011",
                                size: 1024 * 5,
                            },
                        },
                        {
                            type: CHAT_TOOL.GENERATE_FILE,
                            toolCallId: "file-2",
                            state: "output-available",
                            input: {
                                prompt: "Create a JavaScript script",
                                filename: "script.js",
                            },
                            output: {
                                fileUrl:
                                    "https://example.com/generated-script.js",
                                name: "generated-script.js",
                                extension: "js",
                                id: "00000000-0000-0000-0000-000000000012",
                                size: 1024 * 4,
                            },
                        },
                        {
                            type: CHAT_TOOL.GENERATE_FILE,
                            toolCallId: "file-3",
                            state: "output-available",
                            input: {
                                prompt: "Create a HTML file",
                                filename: "index.html",
                            },
                            output: {
                                fileUrl:
                                    "https://example.com/generated-index.html",
                                name: "generated-index.html",
                                extension: "html",
                                id: "00000000-0000-0000-0000-000000000013",
                                size: 1024 * 3,
                            },
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const AssistantWithMarkdown = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
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
                ]}
            />
        ),
    ],
});

export const UserUploadWithAssistantResponse = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessageWithFiles("Analyze this image:", [
                        {
                            kind: CHAT_MESSAGE_TYPE.IMAGE,
                            type: CHAT_MESSAGE_TYPE.FILE,
                            name: "chart.png",
                            url: "https://picsum.photos/id/239/800/600",
                            mediaType: "image/png",
                            size: 1024 * 300,
                            extension: "png",
                            width: 800,
                            height: 600,
                        },
                    ]),
                    createMockAssistantMessageWithParts([
                        {
                            type: CHAT_MESSAGE_TYPE.TEXT,
                            text: "I can see the image you uploaded. Here's my analysis:\n\n## Analysis\n\n- **Type**: Chart/Graph\n- **Content**: Data visualization\n- **Recommendations**: Consider adding labels for better clarity",
                        },
                    ]),
                ]}
            />
        ),
    ],
});

export const WithError = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[createMockUserMessage("This will cause an error")]}
                status="error"
                error={new Error("Failed to process request")}
            />
        ),
    ],
});

WithError.test("should show error message", async ({ canvas }) => {
    await waitFor(() => {
        const errorMessage = canvas.getByText(
            /something went wrong\. please try again\./i,
        );
        expect(errorMessage).toBeInTheDocument();
    });
});

export const WithLoading = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("What's the weather in New York?"),
                    createMockAssistantMessageWithParts([
                        {
                            type: "tool-getWeather",
                            toolCallId: "weather-1",
                            state: "input-streaming",
                            input: {
                                location: {
                                    city: "New York",
                                    country: "United States",
                                },
                            },
                            output: undefined,
                        },
                    ]),
                ]}
                status="streaming"
            />
        ),
    ],
});

WithLoading.test(
    "should show loader with tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const loader = canvas.getByRole("status", { hidden: true });
            expect(loader).toBeInTheDocument();
        });

        await waitFor(() => {
            const toolDescription = canvas.getByText(
                /getting the weather\.\.\./i,
            );
            expect(toolDescription).toBeInTheDocument();
        });
    },
);

export const ComplexConversation = meta.story({
    name: "Complex Conversation",
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage("What's the weather in London?"),
                    createMockAssistantMessageWithParts([
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
                    ]),
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
                    ),
                    createMockAssistantMessageWithParts([
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
                    ]),
                ]}
            />
        ),
    ],
});

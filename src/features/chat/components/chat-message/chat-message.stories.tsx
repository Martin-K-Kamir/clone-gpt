import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useMemo } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

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
    UIFileMessagePart,
    UIUserChatMessage,
} from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
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

import { PureChatMessage } from "./chat-message";

const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const mockMessageId = "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
const mockAssistantMessageId =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";

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

const FIXED_WEATHER_START_DATE = new Date("2024-01-15T12:00:00Z");
const FIXED_SUNRISE_TIMESTAMP = 1705320000;
const FIXED_SUNSET_TIMESTAMP = 1705356000;

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
    userId = mockUserId,
    chatId = mockChatId,
}: {
    Story: React.ComponentType;
    userId?: DBUserId;
    chatId?: DBChatId;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={userId}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={chatId}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <div className="w-full max-w-4xl bg-zinc-950 p-8">
                                            <Story />
                                        </div>
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
    component: PureChatMessage,
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

export const UserMessage = meta.story({
    name: "User Message",
    args: {
        message: createMockUserMessage("Hello, how can you help me today?"),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessage.test("should render user message", async ({ canvas }) => {
    const article = canvas.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("data-role", "user");
});

UserMessage.test("should display user message text", async ({ canvas }) => {
    const messageText = canvas.getByText(/hello, how can you help me today\?/i);
    expect(messageText).toBeInTheDocument();
});

UserMessage.test(
    "should show action buttons for user message",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.getByRole("button", {
            name: /update/i,
        });
        expect(copyButton).toBeInTheDocument();
        expect(updateButton).toBeInTheDocument();
    },
);

export const UserMessageLong = meta.story({
    name: "User Message (Long Text)",
    args: {
        message: createMockUserMessage(
            "This is a very long message that should be truncated because it exceeds the maximum content length limit of 150 characters. When a message is too long, it should show a read more button to expand the content.",
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessageLong.test(
    "should truncate long user message and show expand button",
    async ({ canvas }) => {
        const expandButton = canvas.getByRole("button", {
            name: /read more/i,
        });
        expect(expandButton).toBeInTheDocument();

        const truncatedText = canvas.getByText(/\.\.\./);
        expect(truncatedText).toBeInTheDocument();
    },
);

UserMessageLong.test(
    "should expand and collapse long message when button is clicked",
    async ({ canvas, userEvent }) => {
        const expandButton = canvas.getByRole("button", {
            name: /read more/i,
        });

        await userEvent.click(expandButton);

        await waitFor(() => {
            const collapseButton = canvas.getByRole("button", {
                name: /read less/i,
            });
            expect(collapseButton).toBeInTheDocument();
        });

        const collapseButton = canvas.getByRole("button", {
            name: /read less/i,
        });
        await userEvent.click(collapseButton);

        await waitFor(() => {
            const expandButtonAgain = canvas.getByRole("button", {
                name: /read more/i,
            });
            expect(expandButtonAgain).toBeInTheDocument();
        });
    },
);

export const UserMessageWithFiles = meta.story({
    name: "User Message (With Files)",
    args: {
        message: createMockUserMessageWithFiles(
            "Here are some documents I'd like you to review:",
            [
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "document.pdf",
                    url: "https://example.com/document.pdf",
                    mediaType: "application/pdf",
                    size: 1024 * 500, // 500KB
                    extension: "pdf",
                },
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "notes.txt",
                    url: "https://example.com/notes.txt",
                    mediaType: "text/plain",
                    size: 1024 * 10, // 10KB
                    extension: "txt",
                },
            ] as UIFileMessagePart[],
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessageWithFiles.test(
    "should render user message with file uploads",
    async ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(
            /here are some documents i'd like you to review:/i,
        );
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithFiles.test("should display file uploads", async ({ canvas }) => {
    await waitFor(() => {
        const documentFile = canvas.getByText(/document\.pdf/i);
        const notesFile = canvas.getByText(/notes\.txt/i);
        expect(documentFile).toBeInTheDocument();
        expect(notesFile).toBeInTheDocument();
    });
});

UserMessageWithFiles.test(
    "should not have update button",
    async ({ canvas }) => {
        await waitFor(() => {
            const updateButton = canvas.queryByRole("button", {
                name: /update/i,
            });
            expect(updateButton).not.toBeInTheDocument();
        });
    },
);

export const UserMessageWithImages = meta.story({
    name: "User Message (With Images)",
    args: {
        message: createMockUserMessageWithFiles("Check out these images:", [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo1.jpg",
                url: "https://picsum.photos/id/239/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 200, // 200KB
                extension: "jpg",
                width: 1920,
                height: 1080,
            },
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo2.png",
                url: "https://picsum.photos/id/231/800/600",
                mediaType: "image/png",
                size: 1024 * 150, // 150KB
                extension: "png",
                width: 800,
                height: 600,
            },
        ] as UIFileMessagePart[]),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessageWithImages.test(
    "should render user message with image uploads",
    async ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(/check out these images:/i);
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithImages.test(
    "should not have update button",
    async ({ canvas }) => {
        await waitFor(() => {
            const updateButton = canvas.queryByRole("button", {
                name: /update/i,
            });
            expect(updateButton).not.toBeInTheDocument();
        });
    },
);

export const UserMessageWithSingleFile = meta.story({
    name: "User Message (Single File)",
    args: {
        message: createMockUserMessageWithFiles("Here is a document:", [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "report.pdf",
                url: "https://example.com/report.pdf",
                mediaType: "application/pdf",
                size: 1024 * 1024, // 1MB
                extension: "pdf",
            },
        ] as UIFileMessagePart[]),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const UserMessageWithSingleImage = meta.story({
    name: "User Message (Single Image)",
    args: {
        message: createMockUserMessageWithFiles("Check out this image:", [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "landscape.jpg",
                url: "https://picsum.photos/id/1015/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 300, // 300KB
                extension: "jpg",
                width: 1920,
                height: 1080,
            },
        ] as UIFileMessagePart[]),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const UserMessageWithMultipleFiles = meta.story({
    name: "User Message (Multiple Files)",
    args: {
        message: createMockUserMessageWithFiles(
            "Here are multiple documents:",
            Array.from({ length: 10 }, (_, index) => ({
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: `document-${index + 1}.pdf`,
                url: `https://example.com/document-${index + 1}.pdf`,
                mediaType: "application/pdf",
                size: 1024 * (100 + index * 50), // Varying sizes
                extension: "pdf",
            })) as UIFileMessagePart[],
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const UserMessageWithMultipleImages = meta.story({
    name: "User Message (Multiple Images)",
    args: {
        message: createMockUserMessageWithFiles(
            "Here are multiple images:",
            Array.from({ length: 10 }, (_, index) => ({
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: `photo-${index + 1}.jpg`,
                url: `https://picsum.photos/id/${160 + index}/800/600`,
                mediaType: "image/jpeg",
                size: 1024 * (150 + index * 20), // Varying sizes
                extension: "jpg",
                width: 1920,
                height: 1080,
            })) as UIFileMessagePart[],
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const UserMessageWithFilesAndImages = meta.story({
    name: "User Message (Files and Images)",
    args: {
        message: createMockUserMessageWithFiles(
            "Here are some files and images:",
            [
                // Files
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "document.pdf",
                    url: "https://example.com/document.pdf",
                    mediaType: "application/pdf",
                    size: 1024 * 500,
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
                // Images
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "photo1.jpg",
                    url: "https://picsum.photos/id/239/800/600",
                    mediaType: "image/jpeg",
                    size: 1024 * 200,
                    extension: "jpg",
                    width: 1920,
                    height: 1080,
                },
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "photo2.png",
                    url: "https://picsum.photos/id/231/800/600",
                    mediaType: "image/png",
                    size: 1024 * 150,
                    extension: "png",
                    width: 800,
                    height: 600,
                },
            ] as UIFileMessagePart[],
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessageWithFilesAndImages.test(
    "should render user message with files and images",
    async ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(
            /here are some files and images:/i,
        );
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithFilesAndImages.test(
    "should display both files and images",
    async ({ canvas }) => {
        await waitFor(() => {
            const documentFile = canvas.getByText(/document\.pdf/i);
            const notesFile = canvas.getByText(/notes\.txt/i);
            expect(documentFile).toBeInTheDocument();
            expect(notesFile).toBeInTheDocument();
        });
    },
);

export const UserMessageUpdating = meta.story({
    name: "User Message (Updating)",
    args: {
        message: createMockUserMessage("Original message text"),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

UserMessageUpdating.test(
    "should show prompt composer when updating message",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const updateButton = canvas.getByRole("button", {
                name: /update/i,
            });
            expect(updateButton).toBeInTheDocument();
        });

        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
            expect(textarea).toHaveValue("Original message text");
        });
    },
);

UserMessageUpdating.test(
    "should allow typing in the prompt composer",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
        });

        const textarea = canvas.getByRole("textbox");
        await userEvent.clear(textarea);
        await userEvent.type(textarea, "Updated message text");

        expect(textarea).toHaveValue("Updated message text");
    },
);

UserMessageUpdating.test(
    "should cancel update and return to message view",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
        });

        const cancelButton = canvas.getByRole("button", { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();

        await userEvent.click(cancelButton);

        await waitFor(() => {
            const textarea = canvas.queryByRole("textbox");
            expect(textarea).not.toBeInTheDocument();
        });

        const messageText = canvas.getByText(/original message text/i);
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageUpdating.test(
    "should update message when update button is clicked",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
        });

        const textarea = canvas.getByRole("textbox");
        await userEvent.clear(textarea);
        await userEvent.type(textarea, "This is the updated message");

        const submitUpdateButton = canvas.getByRole("button", {
            name: /update/i,
        });
        expect(submitUpdateButton).toBeInTheDocument();

        await userEvent.click(submitUpdateButton);

        await waitFor(() => {
            const textareaAfterSubmit = canvas.queryByRole("textbox");
            expect(textareaAfterSubmit).not.toBeInTheDocument();
        });
    },
);

export const AssistantMessage = meta.story({
    name: "Assistant Message",
    args: {
        message: createMockAssistantMessage(
            "Hello! I'm here to help you. How can I assist you today?",
        ),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

AssistantMessage.test("should render assistant message", async ({ canvas }) => {
    const article = canvas.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("data-role", "assistant");
});

AssistantMessage.test(
    "should display assistant message text",
    async ({ canvas }) => {
        const messageText = canvas.getByText(
            /hello! i'm here to help you\. how can i assist you today\?/i,
        );
        expect(messageText).toBeInTheDocument();
    },
);

AssistantMessage.test(
    "should show action buttons for assistant message when ready",
    async ({ canvas }) => {
        await waitFor(() => {
            const copyButton = canvas.getByRole("button", { name: /copy/i });
            const regenerateButton = canvas.getByRole("button", {
                name: /try again/i,
            });
            const upvoteButton = canvas.getByRole("button", {
                name: /upvote/i,
            });
            const downvoteButton = canvas.getByRole("button", {
                name: /downvote/i,
            });
            expect(copyButton).toBeInTheDocument();
            expect(regenerateButton).toBeInTheDocument();
            expect(upvoteButton).toBeInTheDocument();
            expect(downvoteButton).toBeInTheDocument();
        });
    },
);

export const AssistantMessageWithMarkdown = meta.story({
    name: "Assistant Message (Markdown)",
    args: {
        message: createMockAssistantMessage(`# Heading 1

## Heading 2

This is a paragraph with **bold text** and *italic text*.

Here's a list:
- Item 1
- Item 2
- Item 3

Here's a code block:

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

And inline code: \`const x = 42;\`

[Link to example](https://example.com)`),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const AssistantMessageWithWeatherTool = meta.story({
    name: "Assistant Message (Weather Tool)",
    args: {
        message: createMockAssistantMessageWithParts([
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
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const AssistantMessageWithGenerateImageTool = meta.story({
    name: "Assistant Message (Generate Image Tool)",
    args: {
        message: createMockAssistantMessageWithParts([
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
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

export const AssistantMessageWithGenerateFileTool = meta.story({
    name: "Assistant Message (Generate File Tool)",
    args: {
        message: createMockAssistantMessageWithParts([
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
                    fileUrl: "https://example.com/generated-script.py",
                    name: "generated-script.py",
                    extension: "py",
                    id: "00000000-0000-0000-0000-000000000011",
                    size: 1024 * 5, // 5KB
                },
            },
        ]),
        chatId: mockChatId,
        status: "ready" as ChatStatus,
    },
});

AssistantMessageWithGenerateFileTool.test(
    "should display generated file",
    async ({ canvas }) => {
        await waitFor(() => {
            const file = canvas.getByText(/generated-script\.py/i);
            expect(file).toBeInTheDocument();
        });
    },
);

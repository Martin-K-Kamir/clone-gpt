import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_MESSAGE_TYPE, CHAT_TOOL } from "@/features/chat/lib/constants";
import type {
    DBChatId,
    UIAssistantChatMessage,
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

import { ChatMessageTools } from "./chat-message-tools";

const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

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
                                    <ChatProvider
                                        userId={mockUserId}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={mockChatId}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <Story />
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
    component: ChatMessageTools,
    decorators: [Story => <StoryWrapper Story={Story} />],
    args: {
        parts: [],
    },
    argTypes: {
        parts: {
            control: false,
            description: "The message parts containing tool outputs",
        },
    },
});

export const Default = meta.story({
    name: "Default (Empty)",
});

Default.test("should render nothing when no tool parts", async ({ canvas }) => {
    const tools = canvas.queryByTestId("chat-message-tools");
    expect(tools?.children.length).toBe(0);
});

export const WithWeatherTool = meta.story({
    args: {
        parts: [
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
        ] as UIAssistantChatMessage["parts"],
    },
    parameters: {
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

WithWeatherTool.test("should render weather component", async ({ canvas }) => {
    await waitFor(() => {
        const weatherComponent = canvas.getByTestId("weather-container");
        expect(weatherComponent).toBeInTheDocument();
    });
});

export const WithGenerateImageTool = meta.story({
    args: {
        parts: [
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
        ] as UIAssistantChatMessage["parts"],
    },
});

WithGenerateImageTool.test("should render image", async ({ canvas }) => {
    await waitFor(() => {
        const images = canvas.getAllByRole("img");
        expect(images.length).toBeGreaterThan(0);
    });
});

export const WithGenerateFileTool = meta.story({
    name: "With Generate File Tool",
    args: {
        parts: [
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
        ] as UIAssistantChatMessage["parts"],
    },
    parameters: {
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

WithGenerateFileTool.test("should render file banner", async ({ canvas }) => {
    await waitFor(() => {
        const file = canvas.getByText(/generated-script\.py/i);
        expect(file).toBeInTheDocument();
    });
});

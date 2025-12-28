import { ChatStatus } from "ai";

import {
    CHAT_MESSAGE_TYPE,
    CHAT_ROLE,
    CHAT_TOOL,
} from "../../../src/features/chat/lib/constants";
import type {
    AssistantChatMessageMetadata,
    ChatMessagePart,
    DBChatId,
    DBChatMessageId,
    UIAssistantChatMessage,
    UIChatMessage,
    UIFileMessagePart,
    UIUserChatMessage,
} from "../../../src/features/chat/lib/types";
import type { DBUserId } from "../../../src/features/user/lib/types";
import {
    TEMPERATURE_SYSTEM,
    TIME_FORMATS,
    WEATHER_PERIOD,
} from "../../../src/lib/constants";
import type { SourcePreview } from "../../../src/lib/types";
import { MOCK_CHAT_ID } from "./chats";
import { MOCK_USER_ID } from "./users";
import {
    createMockWeatherForecasts,
    createMockWeatherLocation,
} from "./weather-tools";

export const MOCK_MESSAGE_ID =
    "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
export const MOCK_ASSISTANT_MESSAGE_ID =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;

export const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";

export const MOCK_CHAT_STATUS = {
    READY: "ready",
    STREAMING: "streaming",
    SUBMITTED: "submitted",
    ERROR: "error",
} as const satisfies Record<string, ChatStatus>;

function createDefaultAssistantMetadata(
    overrides?: Partial<AssistantChatMessageMetadata>,
): AssistantChatMessageMetadata {
    return {
        role: CHAT_ROLE.ASSISTANT,
        createdAt: FIXED_MESSAGE_DATE,
        model: "gpt-4",
        totalTokens: 100,
        isUpvoted: false,
        isDownvoted: false,
        ...overrides,
    };
}

function createDefaultUserMetadata() {
    return {
        role: CHAT_ROLE.USER,
        createdAt: FIXED_MESSAGE_DATE,
    };
}

export function createMockTextMessagePart(text: string): ChatMessagePart {
    return {
        type: CHAT_MESSAGE_TYPE.TEXT,
        text,
    };
}

export function createMockSourceUrlMessagePart(overrides?: {
    sourceId?: string;
    url?: string;
    title?: string;
}): ChatMessagePart {
    const sourceId = overrides?.sourceId ?? "source-1";
    const url = overrides?.url ?? "https://example.com";
    const title = overrides?.title ?? "Example Source";

    return {
        type: "source-url",
        sourceId,
        url,
        title,
    } as ChatMessagePart;
}

export function createMockSourceUrlMessageParts(
    sources: Array<{
        sourceId?: string;
        url: string;
        title: string;
    }>,
): ChatMessagePart[] {
    return sources.map((source, index) =>
        createMockSourceUrlMessagePart({
            sourceId: source.sourceId ?? `source-${index + 1}`,
            url: source.url,
            title: source.title,
        }),
    );
}

export function createMockUserMessage(options?: {
    text?: string;
    messageId?: DBChatMessageId;
}): UIUserChatMessage {
    const text = options?.text ?? "Hello";
    const messageId = options?.messageId ?? MOCK_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: createDefaultUserMetadata(),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

export function createMockAssistantMessage(options?: {
    text?: string;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "Hello!";
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
        ],
    };
}

export function createMockUserMessageWithFiles(options?: {
    text?: string;
    files?: UIFileMessagePart[];
    messageId?: DBChatMessageId;
}): UIUserChatMessage {
    const text = options?.text ?? "Check out these files:";
    const files = options?.files ?? [];
    const messageId = options?.messageId ?? MOCK_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.USER,
        metadata: createDefaultUserMetadata(),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            ...files,
        ],
    };
}

export function createMockAssistantMessageWithParts(
    parts: UIAssistantChatMessage["parts"],
    messageId: DBChatMessageId = MOCK_ASSISTANT_MESSAGE_ID,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(),
        parts,
    };
}

export function createMockMessages(
    count: number,
    baseText: string = "Message",
): Array<UIUserChatMessage | UIAssistantChatMessage> {
    return Array.from({ length: count }, (_, index) => {
        const messageId =
            `${index.toString().padStart(8, "0")}-0000-0000-0000-000000000002` as DBChatMessageId;
        if (index % 2 === 0) {
            return createMockUserMessage({
                text: `${baseText} ${index + 1}`,
                messageId,
            });
        }
        return createMockAssistantMessage({
            text: `Response to ${baseText} ${index + 1}`,
            messageId,
        });
    });
}

export function createMockFileMessagePart(options?: {
    name?: string;
    url?: string;
    mediaType?: string;
    size?: number;
    extension?: string;
}): UIFileMessagePart {
    const name = options?.name ?? "document.pdf";
    const extension = options?.extension ?? name.split(".").pop() ?? "pdf";
    const mediaType =
        options?.mediaType ??
        (extension === "pdf"
            ? "application/pdf"
            : extension === "txt"
              ? "text/plain"
              : "application/octet-stream");
    const url = options?.url ?? `https://example.com/${name}`;
    const size = options?.size ?? 1024 * 500;

    return {
        kind: CHAT_MESSAGE_TYPE.FILE,
        type: CHAT_MESSAGE_TYPE.FILE,
        name,
        url,
        mediaType,
        size,
        extension,
    } as UIFileMessagePart;
}

export function createMockImageMessagePart(options?: {
    name?: string;
    url?: string;
    mediaType?: string;
    size?: number;
    extension?: string;
    width?: number | null;
    height?: number | null;
}): UIFileMessagePart {
    const name = options?.name ?? "photo.jpg";
    const extension = options?.extension ?? name.split(".").pop() ?? "jpg";
    const mediaType =
        options?.mediaType ??
        (extension === "jpg" || extension === "jpeg"
            ? "image/jpeg"
            : extension === "png"
              ? "image/png"
              : "image/jpeg");
    const url = options?.url ?? "https://picsum.photos/id/239/800/600";
    const size = options?.size ?? 1024 * 200;
    const width = options?.width ?? 800;
    const height = options?.height ?? 600;

    return {
        kind: CHAT_MESSAGE_TYPE.IMAGE,
        type: CHAT_MESSAGE_TYPE.FILE,
        name,
        url,
        mediaType,
        size,
        extension,
        width,
        height,
    } as UIFileMessagePart;
}

export function createMockFileMessageParts(
    count: number,
    baseName: string = "document",
    extension: string = "pdf",
): UIFileMessagePart[] {
    return Array.from({ length: count }, (_, index) =>
        createMockFileMessagePart({
            name: `${baseName}-${index + 1}.${extension}`,
            url: `https://example.com/${baseName}-${index + 1}.${extension}`,
            size: 1024 * (100 + index * 50),
            extension,
        }),
    );
}

export function createMockImageMessageParts(
    count: number,
    baseName: string = "photo",
    extension: string = "jpg",
): UIFileMessagePart[] {
    return Array.from({ length: count }, (_, index) =>
        createMockImageMessagePart({
            name: `${baseName}-${index + 1}.${extension}`,
            url: `https://picsum.photos/id/${160 + index}/800/600`,
            size: 1024 * (150 + index * 20),
            extension,
        }),
    );
}

export function createMockAssistantMessageMetadata(
    overrides?: Partial<AssistantChatMessageMetadata>,
): AssistantChatMessageMetadata {
    return createDefaultAssistantMetadata(overrides);
}

export function createMockUpvoteResponseData(overrides?: {
    id?: DBChatMessageId;
    chatId?: DBChatId;
    userId?: DBUserId;
    content?: string;
    metadata?: Partial<AssistantChatMessageMetadata>;
    parts?: UIAssistantChatMessage["parts"];
}) {
    return {
        id: overrides?.id ?? MOCK_ASSISTANT_MESSAGE_ID,
        chatId: overrides?.chatId ?? MOCK_CHAT_ID,
        userId: overrides?.userId ?? MOCK_USER_ID,
        role: "assistant" as const,
        content: overrides?.content ?? "",
        createdAt: FIXED_MESSAGE_DATE,
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: true,
            isDownvoted: false,
            ...overrides?.metadata,
        }),
        parts: overrides?.parts ?? [],
    };
}

export function createMockDownvoteResponseData(overrides?: {
    id?: DBChatMessageId;
    chatId?: DBChatId;
    userId?: DBUserId;
    content?: string;
    metadata?: Partial<AssistantChatMessageMetadata>;
    parts?: UIAssistantChatMessage["parts"];
}) {
    return {
        id: overrides?.id ?? MOCK_ASSISTANT_MESSAGE_ID,
        chatId: overrides?.chatId ?? MOCK_CHAT_ID,
        userId: overrides?.userId ?? MOCK_USER_ID,
        role: "assistant" as const,
        content: overrides?.content ?? "",
        createdAt: FIXED_MESSAGE_DATE,
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: false,
            isDownvoted: true,
            ...overrides?.metadata,
        }),
        parts: overrides?.parts ?? [],
    };
}

export type ChatToolType = (typeof CHAT_TOOL)[keyof typeof CHAT_TOOL];

export function createMockAssistantMessageWithTool(
    toolType: ChatToolType,
): UIChatMessage {
    return createMockAssistantMessageWithParts([
        {
            type: toolType as any,
            toolCallId: `${toolType}-1`,
            state: "input-streaming" as const,
            input: {},
            output: undefined,
        },
    ]) as UIChatMessage;
}

export function createMockAssistantMessageWithGeneratedImage(options?: {
    text?: string;
    prompt?: string;
    name?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
    imageUrl?: string;
    id?: string;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "I've generated an image for you:";
    const prompt = options?.prompt ?? "A beautiful sunset over mountains";
    const name = options?.name ?? "sunset-mountains.jpg";
    const size = options?.size ?? "1024x1024";
    const imageUrl =
        options?.imageUrl ?? "https://picsum.photos/id/1015/800/600";
    const id = options?.id ?? "00000000-0000-0000-0000-000000000010";
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            {
                type: CHAT_TOOL.GENERATE_IMAGE,
                toolCallId: "image-1",
                state: "output-available",
                input: {
                    prompt,
                    name,
                    size,
                },
                output: {
                    imageUrl,
                    name,
                    id: id as `${string}-${string}-${string}-${string}-${string}`,
                    size,
                },
            },
        ],
    };
}

export function createMockAssistantMessageWithGeneratedImages(options?: {
    text?: string;
    images?: Array<{
        prompt?: string;
        name?: string;
        size?: "1024x1024" | "1024x1792" | "1792x1024";
        imageUrl?: string;
        id?: string;
    }>;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "I've generated some images for you:";
    const images = options?.images ?? [
        {
            prompt: "A beautiful sunset over mountains",
            name: "sunset-mountains.jpg",
            imageUrl: "https://picsum.photos/id/1015/800/600",
        },
    ];
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            ...images.map((img, index) => ({
                type: CHAT_TOOL.GENERATE_IMAGE,
                toolCallId: `image-${index + 1}`,
                state: "output-available" as const,
                input: {
                    prompt: img.prompt ?? "A beautiful image",
                    name: img.name ?? `image-${index + 1}.jpg`,
                    size: (img.size ?? "1024x1024") as
                        | "1024x1024"
                        | "1024x1792"
                        | "1792x1024",
                },
                output: {
                    imageUrl:
                        img.imageUrl ??
                        `https://picsum.photos/id/${1015 + index}/800/600`,
                    name: img.name ?? `image-${index + 1}.jpg`,
                    id: (img.id ??
                        `00000000-0000-0000-0000-0000000000${10 + index}`) as `${string}-${string}-${string}-${string}-${string}`,
                    size: (img.size ?? "1024x1024") as
                        | "1024x1024"
                        | "1024x1792"
                        | "1792x1024",
                },
            })),
        ],
    };
}

export function createMockAssistantMessageWithGeneratedFile(options?: {
    text?: string;
    prompt?: string;
    filename?: string;
    fileUrl?: string;
    name?: string;
    extension?: string;
    id?: string;
    size?: number;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "I've generated a file for you:";
    const filename = options?.filename ?? "script.py";
    const prompt =
        options?.prompt ??
        `Create a ${filename.split(".").pop()?.toUpperCase() ?? "Python"} script`;
    const name = options?.name ?? `generated-${filename}`;
    const extension = options?.extension ?? filename.split(".").pop() ?? "py";
    const fileUrl = options?.fileUrl ?? `https://example.com/${name}`;
    const id = options?.id ?? "00000000-0000-0000-0000-000000000011";
    const size = options?.size ?? 5120;
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            {
                type: CHAT_TOOL.GENERATE_FILE,
                toolCallId: "file-1",
                state: "output-available",
                input: {
                    prompt,
                    filename,
                },
                output: {
                    fileUrl,
                    name,
                    extension,
                    id: id as `${string}-${string}-${string}-${string}-${string}`,
                    size,
                },
            },
        ],
    };
}

export function createMockAssistantMessageWithGeneratedFiles(options?: {
    text?: string;
    files?: Array<{
        prompt?: string;
        filename?: string;
        fileUrl?: string;
        name?: string;
        extension?: string;
        id?: string;
        size?: number;
    }>;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "I've generated some files for you:";
    const files = options?.files ?? [
        {
            filename: "script.py",
            fileUrl: "https://example.com/generated-script.py",
        },
    ];
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            ...files.map((file, index) => {
                const filename = file.filename ?? `file-${index + 1}.py`;
                const extension =
                    file.extension ?? filename.split(".").pop() ?? "py";
                const prompt =
                    file.prompt ?? `Create a ${extension.toUpperCase()} file`;
                const name = file.name ?? `generated-${filename}`;
                const fileUrl = file.fileUrl ?? `https://example.com/${name}`;
                const id = (file.id ??
                    `00000000-0000-0000-0000-0000000000${11 + index}`) as `${string}-${string}-${string}-${string}-${string}`;
                const size = file.size ?? 5120 - index * 1024;

                return {
                    type: CHAT_TOOL.GENERATE_FILE,
                    toolCallId: `file-${index + 1}`,
                    state: "output-available" as const,
                    input: {
                        prompt,
                        filename,
                    },
                    output: {
                        fileUrl,
                        name,
                        extension,
                        id,
                        size,
                    },
                };
            }),
        ],
    };
}

export function createMockAssistantMessageWithWeather(options?: {
    text?: string;
    city?: string;
    country?: string;
    messageId?: DBChatMessageId;
    metadata?: Partial<AssistantChatMessageMetadata>;
}): UIAssistantChatMessage {
    const text = options?.text ?? "Here's the weather forecast for New York:";
    const city = options?.city ?? "New York";
    const country = options?.country ?? "United States";
    const messageId = options?.messageId ?? MOCK_ASSISTANT_MESSAGE_ID;

    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: createDefaultAssistantMetadata(options?.metadata),
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text,
            },
            {
                type: CHAT_TOOL.GET_WEATHER,
                toolCallId: "weather-1",
                state: "output-available",
                input: {
                    location: {
                        city,
                        country,
                    },
                    forecastLimit: 12,
                    period: WEATHER_PERIOD.CURRENT,
                    temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                    timeFormat: TIME_FORMATS.HOUR_24,
                    language: "en",
                },
                output: {
                    location: createMockWeatherLocation(city, country),
                    forecasts: createMockWeatherForecasts(
                        12,
                        WEATHER_PERIOD.CURRENT,
                    ),
                    period: WEATHER_PERIOD.CURRENT,
                    timeFormat: TIME_FORMATS.HOUR_24,
                    temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                    language: "en",
                },
            },
        ],
    };
}

export const MOCK_USER_MESSAGE_WITH_SINGLE_FILE =
    createMockUserMessageWithFiles({
        text: "Here's a document:",
        files: [
            createMockFileMessagePart({
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                size: 1024 * 500,
            }),
        ],
    });
export const MOCK_USER_MESSAGE_WITH_SINGLE_IMAGE =
    createMockUserMessageWithFiles({
        text: "Here's an image:",
        files: [
            createMockImageMessagePart({
                name: "photo.jpg",
                url: "https://picsum.photos/id/239/800/600",
                size: 1024 * 200,
            }),
        ],
    });
export const MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES =
    createMockUserMessageWithFiles({
        text: "Here are some documents:",
        files: [
            createMockFileMessagePart({
                name: "document1.pdf",
                url: "https://example.com/document1.pdf",
                size: 1024 * 500,
            }),
            createMockFileMessagePart({
                name: "document2.pdf",
                url: "https://example.com/document2.pdf",
                size: 1024 * 600,
            }),
        ],
    });
export const MOCK_USER_MESSAGE_WITH_MULTIPLE_IMAGES =
    createMockUserMessageWithFiles({
        text: "Here are some images:",
        files: [
            createMockImageMessagePart({
                name: "photo1.jpg",
                url: "https://picsum.photos/id/239/800/600",
                size: 1024 * 200,
            }),
            createMockImageMessagePart({
                name: "photo2.jpg",
                url: "https://picsum.photos/id/240/800/600",
                size: 1024 * 220,
            }),
        ],
    });

export const MOCK_FILE_PARTS_SINGLE =
    MOCK_USER_MESSAGE_WITH_SINGLE_FILE.parts.filter(
        (p: ChatMessagePart): p is UIFileMessagePart => p.type === "file",
    );

export const MOCK_FILE_PARTS_MULTIPLE =
    MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES.parts.filter(
        (p: ChatMessagePart): p is UIFileMessagePart => p.type === "file",
    );

export const MOCK_IMAGE_PARTS_SINGLE =
    MOCK_USER_MESSAGE_WITH_SINGLE_IMAGE.parts.filter(
        (p: ChatMessagePart): p is UIFileMessagePart => p.type === "file",
    );

export const MOCK_IMAGE_PARTS_MULTIPLE =
    MOCK_USER_MESSAGE_WITH_MULTIPLE_IMAGES.parts.filter(
        (p: ChatMessagePart): p is UIFileMessagePart => p.type === "file",
    );

export const MOCK_FILE_AND_IMAGE_PARTS = [
    ...MOCK_FILE_PARTS_MULTIPLE,
    ...MOCK_IMAGE_PARTS_MULTIPLE,
];

export const MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES: ChatMessagePart[] = [
    createMockTextMessagePart(
        "Here's some information based on the following sources:",
    ),
    ...createMockSourceUrlMessageParts([
        {
            url: "https://github.com/vercel/next.js",
            title: "Next.js - The React Framework",
        },
        {
            url: "https://react.dev/reference/react",
            title: "React Reference Documentation",
        },
        {
            url: "https://tailwindcss.com/docs",
            title: "Tailwind CSS Documentation",
        },
    ]),
];

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedImage({
        prompt: "A beautiful sunset over mountains",
        name: "sunset-mountains.jpg",
        imageUrl: "https://picsum.photos/id/1015/800/600",
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_PORTRAIT: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedImage({
        text: "I've generated a portrait image for you:",
        prompt: "A beautiful portrait of a landscape",
        name: "portrait-image.jpg",
        size: "1024x1792",
        imageUrl: "https://picsum.photos/id/1020/1024/1792",
        id: "00000000-0000-0000-0000-000000000014",
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_LANDSCAPE: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedImage({
        text: "I've generated a landscape image for you:",
        prompt: "A beautiful wide landscape view",
        name: "landscape-image.jpg",
        size: "1792x1024",
        imageUrl: "https://picsum.photos/id/1018/1792/1024",
        id: "00000000-0000-0000-0000-000000000015",
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGES: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedImages({
        images: [
            {
                prompt: "A beautiful sunset over mountains",
                name: "sunset-mountains.jpg",
                imageUrl: "https://picsum.photos/id/1015/800/600",
            },
            {
                prompt: "A beautiful sunrise over mountains",
                name: "sunrise-mountains.jpg",
                imageUrl: "https://picsum.photos/id/1016/800/600",
            },
            {
                prompt: "A beautiful sunset over the ocean",
                name: "sunset-ocean.jpg",
                imageUrl: "https://picsum.photos/id/1018/800/600",
                id: "00000000-0000-0000-0000-000000000013",
            },
        ],
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedFile({
        filename: "script.py",
        fileUrl: "https://example.com/generated-script.py",
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILES: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedFiles({
        files: [
            {
                filename: "script.py",
                fileUrl: "https://example.com/generated-script.py",
            },
            {
                filename: "script.js",
                fileUrl: "https://example.com/generated-script.js",
                size: 4096,
                id: "00000000-0000-0000-0000-000000000012",
            },
            {
                filename: "index.html",
                fileUrl: "https://example.com/generated-index.html",
                size: 3072,
                id: "00000000-0000-0000-0000-000000000013",
            },
        ],
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_WEATHER: UIAssistantChatMessage =
    createMockAssistantMessageWithWeather();

export const MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN: UIAssistantChatMessage =
    createMockAssistantMessage({
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
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_IMAGE_ANALYSIS: UIAssistantChatMessage =
    createMockAssistantMessage({
        text: "I can see the image you uploaded. Here's my analysis:\n\n## Analysis\n\n- **Type**: Chart/Graph\n- **Content**: Data visualization\n- **Recommendations**: Consider adding labels for better clarity",
    });

export const MOCK_ASSISTANT_MESSAGE_WITH_REFERENCE_IMAGE: UIAssistantChatMessage =
    createMockAssistantMessageWithGeneratedImage({
        text: "I've generated an image based on your reference:",
        prompt: "A similar style image",
        name: "generated.jpg",
        imageUrl: "https://picsum.photos/id/1018/800/600",
        id: "00000000-0000-0000-0000-000000000012",
    });

// Tool parts constants (filtered from message examples)
export const MOCK_TOOL_PARTS_WEATHER =
    MOCK_ASSISTANT_MESSAGE_WITH_WEATHER.parts.filter(
        p => p.type === "tool-getWeather",
    ) as ChatMessagePart[];

export const MOCK_TOOL_PARTS_GENERATE_IMAGE =
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE.parts.filter(
        p => p.type === "tool-generateImage",
    ) as ChatMessagePart[];

export const MOCK_TOOL_PARTS_GENERATE_FILE =
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE.parts.filter(
        p => p.type === "tool-generateFile",
    ) as ChatMessagePart[];

export const MOCK_SOURCE_PARTS = createMockSourceUrlMessageParts([
    {
        url: "https://github.com/vercel/next.js",
        title: "Next.js - The React Framework",
    },
    {
        url: "https://react.dev/reference/react",
        title: "React Reference Documentation",
    },
    {
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS Documentation",
    },
]);

export const MOCK_ADDITIONAL_SOURCE_PARTS = createMockSourceUrlMessageParts([
    {
        url: "https://www.typescriptlang.org/docs",
        title: "TypeScript Documentation",
    },
    {
        url: "https://nodejs.org/docs",
        title: "Node.js Documentation",
    },
]);

export const MOCK_SOURCE_PREVIEWS: SourcePreview[] = [
    {
        url: "https://github.com/vercel/next.js",
        title: "Next.js by Vercel - The React Framework for the Web",
        description:
            "Production grade React applications that scale. The world's leading companies use Next.js to build static and dynamic websites and web applications.",
        siteName: "GitHub",
        image: "https://opengraph.githubassets.com/next.js",
        favicon: "https://github.githubassets.com/favicons/favicon.svg",
    },
    {
        url: "https://react.dev/reference/react",
        title: "React Reference Overview",
        description:
            "The React reference documentation provides detailed information about working with React.",
        siteName: "React",
        image: "https://react.dev/images/og-home.png",
        favicon: "https://react.dev/favicon.ico",
    },
    {
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS - Documentation",
        description:
            "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
        siteName: "Tailwind CSS",
        image: "https://tailwindcss.com/og-image.png",
        favicon: "https://tailwindcss.com/favicon.ico",
    },
];

export const MOCK_SOURCE_SINGLE_PREVIEW: SourcePreview =
    MOCK_SOURCE_PREVIEWS[0];

export const MOCK_ADDITIONAL_SOURCE_PREVIEWS: SourcePreview[] = [
    {
        url: "https://www.typescriptlang.org/docs",
        title: "TypeScript Documentation",
        description: "TypeScript documentation",
        siteName: "TypeScript",
        image: "",
        favicon: "",
    },
    {
        url: "https://nodejs.org/docs",
        title: "Node.js Documentation",
        description: "Node.js documentation",
        siteName: "Node.js",
        image: "",
        favicon: "",
    },
];

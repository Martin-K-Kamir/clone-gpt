import {
    CHAT_MESSAGE_TYPE,
    CHAT_TOOL,
} from "../../../src/features/chat/lib/constants";
import type {
    ChatMessagePart,
    DBChatMessageId,
    UIAssistantChatMessage,
} from "../../../src/features/chat/lib/types";

export const MOCK_GENERATE_IMAGE_ID =
    "00000000-0000-0000-0000-000000000010" as DBChatMessageId;
export const MOCK_GENERATE_FILE_ID =
    "00000000-0000-0000-0000-000000000011" as DBChatMessageId;

export function createMockGenerateImageInput(overrides?: {
    prompt?: string;
    name?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
}) {
    return {
        prompt: overrides?.prompt ?? "A beautiful sunset over mountains",
        name: overrides?.name ?? "sunset-mountains.jpg",
        size: (overrides?.size ?? "1024x1024") as
            | "1024x1024"
            | "1024x1792"
            | "1792x1024",
    };
}

export function createMockGenerateImageOutput(overrides?: {
    imageUrl?: string;
    name?: string;
    id?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
}) {
    return {
        imageUrl:
            overrides?.imageUrl ?? "https://picsum.photos/id/1015/800/600",
        name: overrides?.name ?? "sunset-mountains.jpg",
        id: overrides?.id ?? MOCK_GENERATE_IMAGE_ID,
        size: (overrides?.size ?? "1024x1024") as
            | "1024x1024"
            | "1024x1792"
            | "1792x1024",
    };
}

export function createMockGenerateImageToolPart(overrides?: {
    toolCallId?: string;
    state?: "output-available" | "output-error" | "input-required";
    input?: {
        prompt?: string;
        name?: string;
        size?: "1024x1024" | "1024x1792" | "1792x1024";
    };
    output?: {
        imageUrl?: string;
        name?: string;
        id?: string;
        size?: "1024x1024" | "1024x1792" | "1792x1024";
    };
}): ChatMessagePart {
    const state = overrides?.state ?? "output-available";
    return {
        type: CHAT_TOOL.GENERATE_IMAGE,
        toolCallId: overrides?.toolCallId ?? "image-1",
        state: state as "output-available",
        input: createMockGenerateImageInput(overrides?.input),
        output: createMockGenerateImageOutput(overrides?.output),
    } as ChatMessagePart;
}

export function createMockGenerateFileInput(overrides?: {
    filename?: string;
    prompt?: string;
}) {
    return {
        filename: overrides?.filename ?? "script.py",
        prompt: overrides?.prompt ?? "Create a Python script",
    };
}

export function createMockGenerateFileOutput(overrides?: {
    fileUrl?: string;
    name?: string;
    extension?: string;
    id?: string;
    size?: number;
}) {
    const filename = overrides?.name ?? "generated-script.py";
    const extension = overrides?.extension ?? filename.split(".").pop() ?? "py";

    return {
        fileUrl: overrides?.fileUrl ?? `https://example.com/${filename}`,
        name: filename,
        extension,
        id: overrides?.id ?? MOCK_GENERATE_FILE_ID,
        size: overrides?.size ?? 1024 * 5, // 5KB
    };
}

export function createMockGenerateFileToolPart(overrides?: {
    toolCallId?: string;
    state?: "output-available" | "output-error" | "input-required";
    input?: {
        filename?: string;
        prompt?: string;
    };
    output?: {
        fileUrl?: string;
        name?: string;
        extension?: string;
        id?: string;
        size?: number;
    };
}): ChatMessagePart {
    const state = overrides?.state ?? "output-available";
    return {
        type: CHAT_TOOL.GENERATE_FILE,
        toolCallId: overrides?.toolCallId ?? "file-1",
        state: state as "output-available",
        input: createMockGenerateFileInput(overrides?.input),
        output: createMockGenerateFileOutput(overrides?.output),
    } as ChatMessagePart;
}

export function createMockGenerateImageToolParts(
    text: string = "I've generated an image for you:",
    toolPartOverrides?: Parameters<typeof createMockGenerateImageToolPart>[0],
): UIAssistantChatMessage["parts"] {
    return [
        {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text,
        },
        createMockGenerateImageToolPart(toolPartOverrides),
    ];
}

export function createMockGenerateFileToolParts(
    text: string = "I've generated a file for you:",
    toolPartOverrides?: Parameters<typeof createMockGenerateFileToolPart>[0],
): UIAssistantChatMessage["parts"] {
    return [
        {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text,
        },
        createMockGenerateFileToolPart(toolPartOverrides),
    ];
}

export function createMockGenerateImageToolPartsMultiple(
    text: string = "I've generated some images for you:",
    toolParts: Array<Parameters<typeof createMockGenerateImageToolPart>[0]>,
): UIAssistantChatMessage["parts"] {
    return [
        {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text,
        },
        ...toolParts.map((overrides, index) =>
            createMockGenerateImageToolPart({
                toolCallId: `image-${index + 1}`,
                ...overrides,
            }),
        ),
    ];
}

export function createMockGenerateFileToolPartsMultiple(
    text: string = "I've generated some files for you:",
    toolParts: Array<Parameters<typeof createMockGenerateFileToolPart>[0]>,
): UIAssistantChatMessage["parts"] {
    return [
        {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text,
        },
        ...toolParts.map((overrides, index) =>
            createMockGenerateFileToolPart({
                toolCallId: `file-${index + 1}`,
                ...overrides,
            }),
        ),
    ];
}

export function createMockGenerateImageToolPartOptions(overrides?: {
    prompt?: string;
    name?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
    imageUrl?: string;
    id?: string;
}): Parameters<typeof createMockGenerateImageToolPart>[0] {
    const prompt = overrides?.prompt ?? "A beautiful sunset over mountains";
    const name = overrides?.name ?? "sunset-mountains.jpg";
    const size = overrides?.size ?? "1024x1024";
    const imageUrl =
        overrides?.imageUrl ?? "https://picsum.photos/id/1015/800/600";

    return {
        input: {
            prompt,
            name,
            size,
        },
        output: {
            imageUrl,
            name,
            id: overrides?.id ?? MOCK_GENERATE_IMAGE_ID,
            size,
        },
    };
}

export function createMockGenerateFileToolPartOptions(overrides?: {
    prompt?: string;
    filename?: string;
    fileUrl?: string;
    name?: string;
    extension?: string;
    id?: string;
    size?: number;
}): Parameters<typeof createMockGenerateFileToolPart>[0] {
    const filename = overrides?.filename ?? "script.py";
    const prompt =
        overrides?.prompt ??
        `Create a ${filename.split(".").pop()?.toUpperCase() ?? "Python"} script`;
    const name = overrides?.name ?? `generated-${filename}`;
    const extension = overrides?.extension ?? filename.split(".").pop() ?? "py";
    const fileUrl = overrides?.fileUrl ?? `https://example.com/${name}`;

    return {
        input: {
            prompt,
            filename,
        },
        output: {
            fileUrl,
            name,
            extension,
            id: overrides?.id ?? MOCK_GENERATE_FILE_ID,
            size: overrides?.size ?? 1024 * 5,
        },
    };
}

export function createMockAssistantMessageWithGeneratedImageParts(options?: {
    text?: string;
    prompt?: string;
    name?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
    imageUrl?: string;
    id?: string;
}): UIAssistantChatMessage["parts"] {
    return createMockGenerateImageToolParts(
        options?.text ?? "I've generated an image for you:",
        createMockGenerateImageToolPartOptions({
            prompt: options?.prompt,
            name: options?.name,
            size: options?.size,
            imageUrl: options?.imageUrl,
            id: options?.id,
        }),
    );
}

export function createMockAssistantMessageWithGeneratedImagesParts(options?: {
    text?: string;
    images?: Array<{
        prompt?: string;
        name?: string;
        size?: "1024x1024" | "1024x1792" | "1792x1024";
        imageUrl?: string;
        id?: string;
    }>;
}): UIAssistantChatMessage["parts"] {
    return createMockGenerateImageToolPartsMultiple(
        options?.text ?? "I've generated some images for you:",
        (options?.images ?? []).map(img =>
            createMockGenerateImageToolPartOptions({
                prompt: img.prompt,
                name: img.name,
                size: img.size,
                imageUrl: img.imageUrl,
                id: img.id,
            }),
        ),
    );
}

export function createMockAssistantMessageWithGeneratedFileParts(options?: {
    text?: string;
    prompt?: string;
    filename?: string;
    fileUrl?: string;
    name?: string;
    extension?: string;
    id?: string;
    size?: number;
}): UIAssistantChatMessage["parts"] {
    return createMockGenerateFileToolParts(
        options?.text ?? "I've generated a file for you:",
        createMockGenerateFileToolPartOptions({
            prompt: options?.prompt,
            filename: options?.filename,
            fileUrl: options?.fileUrl,
            name: options?.name,
            extension: options?.extension,
            id: options?.id,
            size: options?.size,
        }),
    );
}

export function createMockAssistantMessageWithGeneratedFilesParts(options?: {
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
}): UIAssistantChatMessage["parts"] {
    return createMockGenerateFileToolPartsMultiple(
        options?.text ?? "I've generated some files for you:",
        (options?.files ?? []).map(file =>
            createMockGenerateFileToolPartOptions({
                prompt: file.prompt,
                filename: file.filename,
                fileUrl: file.fileUrl,
                name: file.name,
                extension: file.extension,
                id: file.id,
                size: file.size,
            }),
        ),
    );
}

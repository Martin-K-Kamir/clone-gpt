import { z } from "zod";

import {
    CHAT_ACCEPTED_FILES,
    CHAT_ACCEPTED_FILE_SIZE,
    CHAT_CHARACTER_MAX_LIMIT,
    CHAT_CHARACTER_MIN_LIMIT,
    CHAT_FILES_MAX_LIMIT,
} from "@/features/chat/lib/constants/chat";

import { userChatPreferenceSchema } from "@/features/user/lib/schemas";

import {
    formatBytesSize,
    isFileTypeAllowed,
    validateFileContent,
} from "@/lib/utils";

import {
    CHAT_ROLES,
    CHAT_TRIGGERS,
    CHAT_VISIBILITY_VALUES,
} from "./constants/chat";

export const chatRoleEnum = z.enum(CHAT_ROLES);
export const chatVisibilityEnum = z.enum(CHAT_VISIBILITY_VALUES);

const toolPartSchema = z.object({
    type: z.string().regex(/^tool-.+$/) as z.ZodType<`tool-${string}`>,
    input: z.any(),
    output: z.any(),
});

const stepPartSchema = z.object({
    type: z.string().regex(/^step-.+$/) as z.ZodType<`step-${string}`>,
});

const textPartSchema = z.object({
    type: z.literal("text"),
    text: z
        .string()
        .min(CHAT_CHARACTER_MIN_LIMIT, {
            message: `Minimum ${CHAT_CHARACTER_MIN_LIMIT} characters are required.`,
        })
        .max(CHAT_CHARACTER_MAX_LIMIT, {
            message: `Maximum ${CHAT_CHARACTER_MAX_LIMIT} characters are allowed.`,
        }),
});

const filePartSchema = z.object({
    type: z.literal("file"),
    mediaType: z.string().min(1),
    url: z.string().url(),
    text: z.string().optional(),
});

const fileTextPartSchema = z.object({
    type: z.literal("text"),
    text: z
        .string()
        .min(CHAT_CHARACTER_MIN_LIMIT, {
            message: `Minimum ${CHAT_CHARACTER_MIN_LIMIT} characters are required.`,
        })
        .max(CHAT_CHARACTER_MAX_LIMIT, {
            message: `Maximum ${CHAT_CHARACTER_MAX_LIMIT} characters are allowed.`,
        }),
    url: z.string().url(),
    mediaType: z.string().min(1),
});

const chatMessagePartSchema = z.union([
    textPartSchema,
    stepPartSchema,
    toolPartSchema,
    filePartSchema,
    fileTextPartSchema,
]);

export const assistantChatMessageMetadataSchema = z.object({
    role: z.literal("assistant"),
    createdAt: z.string(),
    model: z.string(),
    totalTokens: z.number(),
    isUpvoted: z.boolean(),
    isDownvoted: z.boolean(),
});

export const userChatMessageMetadataSchema = z.object({
    role: z.literal("user"),
    createdAt: z.string(),
});

export const assistantMetadataSchema = z.object({
    role: z.literal("assistant"),
    createdAt: z.string(),
});

export const chatMessageMetadataSchema = z.discriminatedUnion("role", [
    assistantChatMessageMetadataSchema,
    userChatMessageMetadataSchema,
]);

export const userChatMessageSchema = z.object({
    role: z.literal("user"),
    metadata: userChatMessageMetadataSchema,
    id: z.string().uuid(),
    parts: z.array(chatMessagePartSchema),
});

export const assistantChatMessageSchema = z.object({
    role: z.literal("assistant"),
    metadata: assistantChatMessageMetadataSchema,
    id: z.string().uuid(),
    parts: z.array(chatMessagePartSchema),
});

export const chatMessageSchema = z.discriminatedUnion("role", [
    assistantChatMessageSchema,
    userChatMessageSchema,
]);

export const chatRequestBodySchema = z.object({
    messageId: z.string().uuid().optional(),
    body: z.object({
        regeneratedMessageRole: z.enum(CHAT_ROLES).optional(),
    }),
    trigger: z.enum(CHAT_TRIGGERS),
    message: userChatMessageSchema,
    userChatPreferences: userChatPreferenceSchema.nullable(),
    chatId: z.string().uuid(),
    newChatId: z.string().uuid().optional(),
});

export const chatSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    visibleAt: z.string(),
    visibility: chatVisibilityEnum,
    userId: z.string().uuid(),
});

export const storedUploadedFileSchema = z.object({
    fileId: z.string().uuid(),
    name: z.string().min(1),
    fileUrl: z.string().url(),
    mediaType: z.string().min(1),
});

export const chatTextSchema = z
    .string()
    .min(CHAT_CHARACTER_MIN_LIMIT, {
        message: `Minimum ${CHAT_CHARACTER_MIN_LIMIT} characters are required.`,
    })
    .max(CHAT_CHARACTER_MAX_LIMIT, {
        message: `Maximum ${CHAT_CHARACTER_MAX_LIMIT} characters are allowed.`,
    });

export const chatFileUploadSchema = z.instanceof(File, {
    message: "Invalid file object",
});

export const chatFileListUploadSchema = z
    .array(chatFileUploadSchema)
    .superRefine(async (files, ctx) => {
        // Check file count limit
        if (files.length > CHAT_FILES_MAX_LIMIT) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Only ${CHAT_FILES_MAX_LIMIT} files are allowed.`,
            });
            return;
        }

        // Check file types
        const invalidTypeFiles = files.filter(
            file => !isFileTypeAllowed(file, CHAT_ACCEPTED_FILES),
        );

        if (invalidTypeFiles.length > 0) {
            const fileName = invalidTypeFiles[0].name;
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Unsupported file type: "${fileName}"`,
            });
            return;
        }

        // Check file sizes
        const oversizedFiles = files.filter(
            file => file.size > CHAT_ACCEPTED_FILE_SIZE,
        );

        if (oversizedFiles.length > 0) {
            const fileName = oversizedFiles[0].name;
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `File size exceeds the ${formatBytesSize(CHAT_ACCEPTED_FILE_SIZE)} limit: "${fileName}"`,
            });
            return;
        }

        // Validate file content
        for (const file of files) {
            const validation = await validateFileContent(
                file,
                CHAT_ACCEPTED_FILES,
            );
            if (!validation.isValid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Unsupported file content: "${file.name}"`,
                });
                return;
            }
        }
    });

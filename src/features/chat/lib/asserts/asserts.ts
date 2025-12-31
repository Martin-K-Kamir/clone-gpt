import { z } from "zod";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import {
    chatRequestBodySchema,
    chatSchema,
    storedUploadedFileSchema,
} from "@/features/chat/lib/schemas";
import type {
    ChatRequestBody,
    DBChat,
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    StoredUploadedFile,
} from "@/features/chat/lib/types";

import { AssertError } from "@/lib/classes";

export function assertIsDBChatId(
    value: unknown,
    message = "Invalid chatId",
): asserts value is DBChatId {
    const schema = z.string().uuid();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsDBChatIds(
    value: unknown,
    message = "Invalid chatIds",
): asserts value is DBChatId[] {
    const schema = z.array(z.string().uuid());
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsDBChatMessageId(
    value: unknown,
    message = "Invalid chat message ID",
): asserts value is DBChatMessageId {
    const schema = z.string().uuid();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsChatTitle(
    value: unknown,
    message = "Invalid chat title",
): asserts value is string {
    const schema = z.string();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsChatVisibility(
    value: unknown,
    message = "Invalid chat visibility",
): asserts value is DBChatVisibility {
    const schema = z.nativeEnum(CHAT_VISIBILITY);
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsUpvote(
    value: unknown,
    message = "Invalid upvote",
): asserts value is boolean {
    const schema = z.boolean();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsDownvote(
    value: unknown,
    message = "Invalid downvote",
): asserts value is boolean {
    const schema = z.boolean();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsChatRequestBodyValid(
    value: unknown,
    message = "Invalid chat request body",
): asserts value is ChatRequestBody {
    const result = chatRequestBodySchema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsPartialChatDataValid(
    value: unknown,
    message = "Invalid chat data",
): asserts value is Partial<DBChat> {
    const schema = chatSchema.partial();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsStoredUploadedFile(
    value: unknown,
    message = "Invalid file data",
): asserts value is StoredUploadedFile {
    const result = storedUploadedFileSchema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsStoredUploadedFiles(
    value: unknown,
    message = "Invalid files data",
): asserts value is StoredUploadedFile[] {
    const schema = z.array(storedUploadedFileSchema);
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

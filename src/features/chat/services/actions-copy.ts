"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatTitle,
    assertIsChatVisibility,
    assertIsDBChatId,
    assertIsDBChatIds,
    assertIsDBChatMessageId,
    assertIsDownvote,
    assertIsStoredUploadedFile,
    assertIsStoredUploadedFiles,
    assertIsUpvote,
} from "@/features/chat/lib/asserts";
import {
    CHAT_MESSAGE_TYPE,
    STORAGE_BUCKET,
} from "@/features/chat/lib/constants";
import { CHAT_UPLOAD_SUPPORTED_MIME_TYPES } from "@/features/chat/lib/constants/chat";
import { chatFileListUploadSchema } from "@/features/chat/lib/schemas";
import type {
    WithChatId,
    WithChatIds,
    WithChatMessageId,
    WithDownvote,
    WithStoredUploadedFile,
    WithStoredUploadedFiles,
    WithUpvote,
    WithVisibility,
} from "@/features/chat/lib/types";

import { api } from "@/lib/api-response";
import { HTTP_ERROR_STATUS, PLURAL } from "@/lib/constants";
import type { WithFiles, WithNewTitle } from "@/lib/types";
import { getFileExtension, getFileImageDimensions } from "@/lib/utils";
import { handleApiError } from "@/lib/utils/handle-api-error";

import {
    deleteAllUserChats as _deleteAllUserChats,
    deleteUserChatById as _deleteUserChatById,
    downvoteChatMessage as _downvoteChatMessage,
    setAllUserChatsVisibility as _setAllUserChatsVisibility,
    updateChatTitle as _updateChatTitle,
    updateChatVisibility as _updateChatVisibility,
    updateManyChatsVisibility as _updateManyChatsVisibility,
    upvoteChatMessage as _upvoteChatMessage,
    isUserChatOwner,
} from "./db";
import {
    deleteUserFile as _deleteUserFile,
    deleteStorageDirectory,
    storeUserFile,
} from "./storage";

export async function deleteUserChatById({ chatId }: WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const isOwner = await isUserChatOwner({
            chatId,
            userId: session.user.id,
        });

        if (!isOwner) {
            return api.error.session.authorization();
        }

        await _deleteUserChatById({ chatId, userId: session.user.id });

        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });
        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_FILES,
        });
        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        return api.success.chat.delete(chatId, {
            count: PLURAL.SINGLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.SINGLE }),
        );
    }
}

export async function deleteAllUserChats() {
    try {
        const session = await auth();
        assertSessionExists(session);

        await _deleteAllUserChats({ userId: session.user.id });

        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });
        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_FILES,
        });
        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        return api.success.chat.delete(undefined, {
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.MULTIPLE }),
        );
    }
}

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    const NEW_CHAT_MAX_TITLE_LENGHT = 25;

    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsChatTitle(newTitle);
        assertIsDBChatId(chatId);

        await _updateChatTitle({
            chatId,
            userId: session.user.id,
            newTitle:
                newTitle.length > NEW_CHAT_MAX_TITLE_LENGHT
                    ? `${newTitle.slice(0, NEW_CHAT_MAX_TITLE_LENGHT)}...`
                    : newTitle,
        });

        return api.success.chat.rename(chatId);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.rename(error));
    }
}

export async function updateChatVisibility({
    chatId,
    visibility,
}: WithChatId & WithVisibility) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatId(chatId);
        assertIsChatVisibility(visibility);

        const data = await _updateChatVisibility({
            visibility,
            chatId,
            userId: session.user.id,
        });

        return api.success.chat.visibility(data.visibility, {
            count: PLURAL.SINGLE,
            visibility,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.visibility(error, {
                visibility,
                count: PLURAL.SINGLE,
            }),
        );
    }
}

export async function updateManyChatsVisibility({
    visibility,
    chatIds,
}: WithVisibility & WithChatIds) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsChatVisibility(visibility);
        assertIsDBChatIds(chatIds);

        const data = await _updateManyChatsVisibility({
            visibility,
            chatIds,
            userId: session.user.id,
        });

        return api.success.chat.visibility(data, {
            visibility,
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.visibility(error, {
                visibility,
                count: PLURAL.MULTIPLE,
            }),
        );
    }
}

export async function setAllUserChatsVisibility({
    visibility,
}: WithVisibility) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsChatVisibility(visibility);

        await _setAllUserChatsVisibility({
            visibility,
            userId: session.user.id,
        });

        return api.success.chat.visibility(undefined, {
            visibility,
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.visibility(error, {
                visibility,
                count: PLURAL.MULTIPLE,
            }),
        );
    }
}

export async function upvoteChatMessage({
    upvote,
    messageId,
    chatId,
}: WithUpvote & WithChatId & WithChatMessageId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsUpvote(upvote);

        const data = await _upvoteChatMessage({
            upvote,
            messageId,
            chatId,
            userId: session.user.id,
        });

        return api.success.chat.upvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.upvote(error));
    }
}

export async function downvoteChatMessage({
    downvote,
    messageId,
    chatId,
}: WithDownvote & WithChatId & WithChatMessageId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsDownvote(downvote);

        const data = await _downvoteChatMessage({
            downvote,
            messageId,
            chatId,
            userId: session.user.id,
        });

        return api.success.chat.downvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.downvote(error));
    }
}

export async function uploadUserFiles({
    files,
    chatId,
}: WithFiles & WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const result = await chatFileListUploadSchema.safeParseAsync(
            Array.from(files),
        );

        if (!result.success) {
            const errorMessages = result.error.errors.map(
                error => error.message,
            );

            return api.error({
                data: files,
                message: errorMessages.join("\n"),
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            });
        }

        const uploadPromises = files.map(file =>
            storeUserFile({
                file,
                chatId,
                userId: session.user.id,
            }),
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        const fileProcessingPromises = uploadedFiles.map(async file => {
            const originalFile = files.find(f => f.name === file.name)!;

            const base = {
                size: originalFile.size,
                extension: getFileExtension(originalFile),
            };

            if (
                !CHAT_UPLOAD_SUPPORTED_MIME_TYPES.includes(
                    file.mediaType as (typeof CHAT_UPLOAD_SUPPORTED_MIME_TYPES)[number],
                )
            ) {
                return {
                    ...file,
                    ...base,
                    kind: CHAT_MESSAGE_TYPE.TEXT,
                    text: await originalFile.text(),
                };
            }

            if (file.mediaType.startsWith("image/")) {
                const { width, height } =
                    await getFileImageDimensions(originalFile);

                return {
                    ...file,
                    ...base,
                    width,
                    height,
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                };
            }

            return {
                ...file,
                ...base,
                kind: CHAT_MESSAGE_TYPE.FILE,
            };
        });

        const processedFiles = await Promise.all(fileProcessingPromises);

        return api.success.file.uploadMany(processedFiles, {
            count: files.length,
        });
    } catch (error) {
        console.error(error);
        return handleApiError(error, () =>
            api.error.file.uploadMany(error, {
                count: files.length,
            }),
        );
    }
}

export async function deleteUserFile({
    storedFile,
    chatId,
}: WithStoredUploadedFile & WithChatId) {
    try {
        const session = await auth();
        assertIsStoredUploadedFile(storedFile);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const data = await _deleteUserFile({
            storedFile,
            chatId,
            userId: session.user.id,
        });

        return api.success.file.delete(data.fileId, {
            fileName: storedFile.name,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.delete(error, {
                fileName: storedFile.name,
            }),
        );
    }
}

export async function deleteUserFiles({
    storedFiles,
    chatId,
}: WithStoredUploadedFiles & WithChatId) {
    try {
        const session = await auth();
        assertIsStoredUploadedFiles(storedFiles);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const data = await Promise.all(
            storedFiles.map(file =>
                _deleteUserFile({
                    chatId,
                    storedFile: file,
                    userId: session.user.id,
                }),
            ),
        );

        return api.success.file.deleteMany(data, {
            count: storedFiles.length,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.deleteMany(error, {
                count: storedFiles.length,
            }),
        );
    }
}

"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import { CHAT_UPLOAD_SUPPORTED_MIME_TYPES } from "@/features/chat/lib/constants/chat";
import { chatFileListUploadSchema } from "@/features/chat/lib/schemas";
import type { WithChatId } from "@/features/chat/lib/types";
import { storeUserFile } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { HTTP_ERROR_STATUS } from "@/lib/constants";
import type { WithFiles } from "@/lib/types";
import { getFileExtension, getFileImageDimensions } from "@/lib/utils";
import { handleApiError } from "@/lib/utils/handle-api-error";

type UploadUserFilesProps = WithFiles & WithChatId;

export async function uploadUserFiles({ files, chatId }: UploadUserFilesProps) {
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

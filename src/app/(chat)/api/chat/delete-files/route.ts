import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBChatId,
    assertIsStoredUploadedFiles,
} from "@/features/chat/lib/asserts";
import { deleteUserFile } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export async function POST(request: NextRequest) {
    const [body, session] = await Promise.all([request.json(), await auth()]);
    const { files, chatId } = body;

    try {
        assertIsStoredUploadedFiles(files);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        if (files.length === 0) {
            return api.error.file.empty().toResponse();
        }

        const data = await Promise.all(
            files.map(file =>
                deleteUserFile({
                    chatId,
                    storedFile: file,
                    userId: session.user.id,
                }),
            ),
        );

        return api.success.file
            .deleteMany(data, {
                count: files.length,
            })
            .toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.file
                .deleteMany(error, {
                    count: files.length,
                })
                .toResponse(),
        );
    }
}

import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import { getChatVisibility } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> },
) {
    try {
        const [session, { chatId }] = await Promise.all([auth(), params]);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const data = await getChatVisibility({ chatId });

        if (!data) {
            return api.error.chat.notFound().toResponse();
        }

        if (data.userId !== session.user.id) {
            return api.error.session.authorization().toResponse();
        }

        return api.success.chat
            .get(data.visibility, { count: PLURAL.SINGLE })
            .toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.chat.get(error, { count: PLURAL.SINGLE }).toResponse(),
        );
    }
}

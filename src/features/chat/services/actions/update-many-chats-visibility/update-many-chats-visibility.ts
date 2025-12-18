"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatVisibility,
    assertIsDBChatIds,
} from "@/features/chat/lib/asserts";
import type { WithChatIds, WithVisibility } from "@/features/chat/lib/types";
import { updateManyChatsVisibility as _updateManyChatsVisibility } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

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

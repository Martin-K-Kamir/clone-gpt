"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsChatVisibility } from "@/features/chat/lib/asserts";
import type { WithVisibility } from "@/features/chat/lib/types";
import { setAllUserChatsVisibility as _setAllUserChatsVisibility } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

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

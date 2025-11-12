import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { getUserChatPreferences } from "@/features/user/services/db";

import { api } from "@/lib/api-response";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";

export async function GET() {
    try {
        const session = await auth();
        assertSessionExists(session);

        const userChatPreferences = await getUserChatPreferences({
            userId: session.user.id,
        });

        return api.success.user
            .getChatPreferences(userChatPreferences)
            .toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.user.getChatPreferences(error).toResponse(),
        );
    }
}

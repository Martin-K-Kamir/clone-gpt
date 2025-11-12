import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { checkUserMessagesRateLimit } from "@/features/user/services/db";

import { api } from "@/lib/api-response";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";

export async function GET() {
    try {
        const session = await auth();
        assertSessionExists(session);

        const rateLimit = await checkUserMessagesRateLimit({
            userId: session.user.id,
            userRole: session.user.role,
        });
        return api.success.user.checkRateLimit(rateLimit).toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.user.checkRateLimit(error).toResponse(),
        );
    }
}

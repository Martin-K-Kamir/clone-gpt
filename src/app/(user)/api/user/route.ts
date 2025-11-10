import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { getUserById } from "@/features/user/services/db";

import { api } from "@/lib/api-response";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export async function GET() {
    try {
        const session = await auth();
        assertSessionExists(session);

        const user = await getUserById({ userId: session.user.id });

        if (!user) {
            return api.error.user.notFound().toResponse();
        }

        return api.success.user.get(user).toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.user.get(error).toResponse(),
        );
    }
}

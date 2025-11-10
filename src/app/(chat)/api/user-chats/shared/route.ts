import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { getUserSharedChats } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        assertSessionExists(session);

        const { searchParams } = req.nextUrl;

        const offset = searchParams.get("offset");
        const limit = searchParams.get("limit");

        const parsedOffset =
            offset !== null && !isNaN(parseInt(offset, 10))
                ? parseInt(offset, 10)
                : undefined;
        const parsedLimit =
            limit !== null && !isNaN(parseInt(limit, 10))
                ? parseInt(limit, 10)
                : undefined;

        const data = await getUserSharedChats({
            userId: session.user.id,
            offset: parsedOffset,
            limit: parsedLimit,
        });

        return api.success.chat
            .getShared(data, { count: PLURAL.MULTIPLE })
            .toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.chat
                .getShared(error, { count: PLURAL.MULTIPLE })
                .toResponse(),
        );
    }
}

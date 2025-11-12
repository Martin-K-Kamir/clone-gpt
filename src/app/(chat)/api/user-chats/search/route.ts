import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { searchUserChats } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        assertSessionExists(session);

        const { searchParams } = req.nextUrl;

        const rawLimit = searchParams.get("limit");
        const query = searchParams.get("query") || "";
        const cursorDate = searchParams.get("cursorDate");
        const cursorId = searchParams.get("cursorId");

        const limit =
            rawLimit !== null && !isNaN(parseInt(rawLimit, 10))
                ? parseInt(rawLimit, 10)
                : undefined;
        const cursor =
            cursorDate && cursorId
                ? { date: cursorDate, id: cursorId }
                : undefined;

        const data = await searchUserChats({
            query,
            cursor,
            limit,
            userId: session.user.id,
        });

        return api.success.chat.search(data).toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.chat.search(error).toResponse(),
        );
    }
}

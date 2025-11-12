import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { getUserChats, getUserChatsByDate } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { ORDER_BY, PLURAL } from "@/lib/constants";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        assertSessionExists(session);

        const { searchParams } = req.nextUrl;

        const offset = searchParams.get("offset");
        const limit = searchParams.get("limit");
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const orderBy = searchParams.get("orderBy");

        const parsedOffset =
            offset !== null && !isNaN(parseInt(offset, 10))
                ? parseInt(offset, 10)
                : undefined;
        const parsedLimit =
            limit !== null && !isNaN(parseInt(limit, 10))
                ? parseInt(limit, 10)
                : undefined;
        const parsedFrom =
            from !== null && !isNaN(new Date(from).getTime())
                ? new Date(from)
                : undefined;
        const parsedTo =
            to !== null && !isNaN(new Date(to).getTime())
                ? new Date(to)
                : undefined;
        const parsedOrderBy =
            orderBy !== null && orderBy === ORDER_BY.UPDATED_AT
                ? ORDER_BY.UPDATED_AT
                : ORDER_BY.CREATED_AT;

        if (parsedFrom) {
            const data = await getUserChatsByDate({
                userId: session.user.id,
                from: parsedFrom,
                to: parsedTo,
                limit: parsedLimit,
                orderBy: parsedOrderBy,
            });

            return api.success.chat
                .get(data, { count: PLURAL.MULTIPLE })
                .toResponse();
        }

        const data = await getUserChats({
            userId: session.user.id,
            offset: parsedOffset,
            limit: parsedLimit,
            orderBy: parsedOrderBy,
        });

        return api.success.chat
            .get(data, { count: PLURAL.MULTIPLE })
            .toResponse();
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.chat.get(error, { count: PLURAL.MULTIPLE }).toResponse(),
        );
    }
}

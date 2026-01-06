"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";
import { createUserMessagesRateLimit } from "@/features/user/services/db/create-user-messages-rate-limit";
import { getUserMessagesRateLimit } from "@/features/user/services/db/get-user-messages-rate-limit";
import { updateUserMessagesRateLimit } from "@/features/user/services/db/update-user-messages-rate-limit";

type IncrementUserMessagesRateLimitProps = {
    increments: { messages?: number; tokens?: number };
} & WithUserId;

export async function incrementUserMessagesRateLimit({
    userId,
    increments,
}: IncrementUserMessagesRateLimitProps) {
    assertIsDBUserId(userId);

    const rateLimit = await getUserMessagesRateLimit({ userId });
    if (!rateLimit) {
        await createUserMessagesRateLimit({ userId });
    }

    const currentRateLimit = rateLimit || {
        messagesCounter: 0,
        tokensCounter: 0,
    };

    await updateUserMessagesRateLimit({
        userId,
        updates: {
            messagesCounter:
                currentRateLimit.messagesCounter + (increments.messages || 0),
            tokensCounter:
                currentRateLimit.tokensCounter + (increments.tokens || 0),
        },
    });
}

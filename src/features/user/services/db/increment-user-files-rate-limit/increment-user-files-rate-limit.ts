"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";
import { createUserFilesRateLimit } from "@/features/user/services/db/create-user-files-rate-limit";
import { getUserFilesRateLimit } from "@/features/user/services/db/get-user-files-rate-limit";
import { updateUserFilesRateLimit } from "@/features/user/services/db/update-user-files-rate-limit";

type IncrementUserFilesRateLimitProps = {
    increments: { files?: number };
} & WithUserId;

export async function incrementUserFilesRateLimit({
    userId,
    increments,
}: IncrementUserFilesRateLimitProps) {
    assertIsDBUserId(userId);

    const rateLimit = await getUserFilesRateLimit({ userId });
    if (!rateLimit) {
        await createUserFilesRateLimit({ userId });
    }

    const currentRateLimit = rateLimit || {
        filesCounter: 0,
    };

    await updateUserFilesRateLimit({
        userId,
        updates: {
            filesCounter:
                currentRateLimit.filesCounter + (increments.files || 0),
        },
    });
}

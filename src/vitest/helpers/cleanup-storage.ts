import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import { hashId } from "@/features/chat/services/storage/hash-id/hash-id";

import { supabase } from "@/services/supabase";

export async function cleanupStorageForUser(userId: string) {
    const hashedUserId = hashId(userId);

    const buckets = Object.values(STORAGE_BUCKET);

    for (const bucket of buckets) {
        try {
            const { data: items, error: listError } = await supabase.storage
                .from(bucket)
                .list(hashedUserId, { limit: 1000 });

            if (listError) {
                if (listError.message.includes("not found")) {
                    continue;
                }
                continue;
            }

            if (!items || items.length === 0) {
                continue;
            }

            const pathsToDelete: string[] = [];

            async function collectPaths(prefix: string) {
                const { data: subItems, error } = await supabase.storage
                    .from(bucket)
                    .list(prefix, { limit: 1000 });

                if (error || !subItems) {
                    return;
                }

                for (const item of subItems) {
                    const fullPath = `${prefix}/${item.name}`;
                    if (item.metadata) {
                        pathsToDelete.push(fullPath);
                    } else {
                        await collectPaths(fullPath);
                    }
                }
            }

            for (const item of items) {
                const path = `${hashedUserId}/${item.name}`;
                if (item.metadata) {
                    pathsToDelete.push(path);
                } else {
                    await collectPaths(path);
                }
            }

            if (pathsToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove(pathsToDelete);

                if (deleteError) {
                    console.warn(
                        `Failed to delete files for user ${userId} in bucket ${bucket}:`,
                        deleteError.message,
                    );
                }
            }
        } catch (error) {
            console.warn(
                `Error cleaning up storage for user ${userId} in bucket ${bucket}:`,
                error instanceof Error ? error.message : String(error),
            );
        }
    }
}

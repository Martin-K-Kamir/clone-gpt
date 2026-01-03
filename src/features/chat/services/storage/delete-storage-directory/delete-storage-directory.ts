import type {
    WithOptionalChatId,
    WithStorageBucket,
} from "@/features/chat/lib/types";
import { hashId } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

type DeleteStorageDirectoryProps = WithStorageBucket &
    WithUserId &
    WithOptionalChatId;

export async function deleteStorageDirectory({
    bucket,
    userId,
    chatId,
}: DeleteStorageDirectoryProps) {
    const hashedUserId = hashId(userId);
    const hashedChatId = chatId ? hashId(chatId) : undefined;
    const rootPath = hashedChatId
        ? `${hashedUserId}/${hashedChatId}`
        : `${hashedUserId}`;

    async function recursiveDelete(directoryPath: string): Promise<void> {
        const { data: items, error: listError } = await supabase.storage
            .from(bucket)
            .list(directoryPath, { limit: 1000 });

        if (listError) {
            throw new Error(
                `Failed to list ${directoryPath}: ${listError.message}`,
            );
        }

        if (!items || items.length === 0) return;

        const filePaths: string[] = [];
        const subfolders: string[] = [];

        items.forEach(item => {
            if (item.metadata) {
                filePaths.push(`${directoryPath}/${item.name}`);
            } else {
                subfolders.push(`${directoryPath}/${item.name}`);
            }
        });

        if (filePaths.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove(filePaths);

            if (deleteError) {
                throw new Error(
                    `Failed to delete files from ${directoryPath}: ${deleteError.message}`,
                );
            }
        }

        await Promise.all(
            subfolders.map(folderPath => recursiveDelete(folderPath)),
        );
    }

    await recursiveDelete(rootPath);

    return { userId, chatId };
}

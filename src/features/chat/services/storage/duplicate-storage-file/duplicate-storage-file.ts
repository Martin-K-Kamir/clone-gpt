import { randomUUID } from "crypto";

import type { WithChatId, WithStorageBucket } from "@/features/chat/lib/types";
import { hashId } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import type { WithName, WithUrl } from "@/lib/types";
import { getFileExtension } from "@/lib/utils";

import { supabase } from "@/services/supabase";

export async function duplicateStorageFile({
    url,
    name,
    chatId,
    userId,
    bucket,
}: WithUrl & WithChatId & WithUserId & WithName & WithStorageBucket) {
    const baseUrl = process.env.SUPABASE_STORAGE_URL!;
    if (!url.startsWith(baseUrl)) {
        throw new Error("Invalid storage URL");
    }

    const sourcePathEncoded = url.split(`/public/${bucket}/`)[1];
    if (!sourcePathEncoded) {
        throw new Error("Failed to extract source path from URL");
    }

    const sourcePath = decodeURIComponent(sourcePathEncoded);

    const fileId = randomUUID();
    const hashedUserId = hashId(userId);
    const hashedChatId = hashId(chatId);
    const extension = getFileExtension(name);

    const destinationPath = `${hashedUserId}/${hashedChatId}/${name}-${fileId}.${extension}`;

    const { error: duplicateError } = await supabase.storage
        .from(bucket)
        .copy(sourcePath, destinationPath);

    if (duplicateError) {
        throw new Error(`Failed to duplicate file: ${duplicateError.message}`);
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(destinationPath);

    return {
        name,
        fileId,
        fileUrl: publicUrl,
    };
}

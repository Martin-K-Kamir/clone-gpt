import { randomUUID } from "crypto";

import type { WithChatId, WithStorageBucket } from "@/features/chat/lib/types";
import { hashId } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import type { WithContentType, WithExtension, WithName } from "@/lib/types";

import { supabase } from "@/services/supabase";

export async function uploadToStorage({
    bucket,
    userId,
    chatId,
    name,
    extension,
    content,
    contentType,
}: {
    content: ArrayBuffer | Uint8Array | Blob | File;
} & WithUserId &
    WithChatId &
    WithName &
    WithExtension &
    WithContentType &
    WithStorageBucket) {
    const id = randomUUID();
    const hashedUserId = hashId(userId);
    const hashedChatId = hashId(chatId);
    const path = `${hashedUserId}/${hashedChatId}/${name}-${id}.${extension}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, content, { contentType, upsert: false });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { id, publicUrl, path };
}

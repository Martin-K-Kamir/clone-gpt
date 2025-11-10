import { createHash, randomUUID } from "crypto";
import "crypto";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type {
    WithChatId,
    WithGeneratedFile,
    WithGeneratedImage,
    WithOptionalChatId,
    WithStorageBucket,
    WithStoredUploadedFile,
} from "@/features/chat/lib/types";

import type { WithUserId } from "@/features/user/lib/types";

import type {
    WithContentType,
    WithExtension,
    WithFile,
    WithName,
    WithUrl,
} from "@/lib/types";
import {
    getFileExtension,
    getMediaTypeExtension,
    removeFileExtension,
} from "@/lib/utils";

import { supabase } from "@/services/supabase";

export function hashId(id: string): string {
    return createHash("sha256").update(id).digest("hex").substring(0, 16);
}

async function uploadToStorage({
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

export async function storeGeneratedImage({
    generatedImage,
    name,
    chatId,
    userId,
}: WithGeneratedImage & WithChatId & WithUserId & WithName) {
    const extension = getMediaTypeExtension(generatedImage.mediaType);

    const { id, publicUrl } = await uploadToStorage({
        userId,
        chatId,
        name,
        extension,
        bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        content: generatedImage.uint8Array,
        contentType: generatedImage.mediaType,
    });

    return { name, imageId: id, imageUrl: publicUrl };
}

export async function storeGeneratedFile({
    generatedFile,
    name,
    extension,
    chatId,
    userId,
    contentType,
}: WithGeneratedFile &
    WithChatId &
    WithUserId &
    WithName &
    WithExtension &
    WithContentType) {
    const { id, publicUrl } = await uploadToStorage({
        userId,
        chatId,
        name,
        extension,
        contentType,
        bucket: STORAGE_BUCKET.GENERATED_FILES,
        content: generatedFile,
    });

    return { name, fileId: id, fileUrl: publicUrl };
}

export async function storeUserFile({
    file,
    userId,
    chatId,
}: WithFile & WithChatId & WithUserId) {
    const fileExtension = getFileExtension(file);
    const fileName = removeFileExtension(file);

    const { id, publicUrl } = await uploadToStorage({
        userId,
        chatId,
        name: fileName,
        bucket: STORAGE_BUCKET.USER_FILES,
        extension: fileExtension,
        content: file,
        contentType: file.type,
    });

    return {
        fileId: id,
        name: file.name,
        fileUrl: publicUrl,
        mediaType: file.type,
    };
}

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

export async function deleteUserFile({
    storedFile,
    chatId,
    userId,
}: WithStoredUploadedFile & WithChatId & WithUserId) {
    const fileId = storedFile.fileId;
    const fileName = removeFileExtension(storedFile.name);
    const fileExtension = getFileExtension(storedFile.name);
    const hashedUserId = hashId(userId);
    const hashedChatId = hashId(chatId);
    const filePath = `${hashedUserId}/${hashedChatId}/${fileName}-${fileId}.${fileExtension}`;

    const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET.USER_FILES)
        .remove([filePath]);

    if (deleteError) {
        throw new Error(
            `Failed to delete file from storage: ${deleteError.message}`,
        );
    }

    return {
        fileId: storedFile.fileId,
    };
}

export async function deleteStorageDirectory({
    bucket,
    userId,
    chatId,
}: WithUserId & WithOptionalChatId & WithStorageBucket) {
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

        subfolders.forEach(async folderPath => {
            await recursiveDelete(folderPath);
        });
    }

    await recursiveDelete(rootPath);

    return { userId, chatId };
}

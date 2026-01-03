import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { WithChatId, WithGeneratedImage } from "@/features/chat/lib/types";
import { uploadToStorage } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import type { WithName } from "@/lib/types";
import { getMediaTypeExtension } from "@/lib/utils";

type StoreGeneratedImageProps = WithGeneratedImage &
    WithChatId &
    WithUserId &
    WithName;

export async function storeGeneratedImage({
    generatedImage,
    name,
    chatId,
    userId,
}: StoreGeneratedImageProps) {
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

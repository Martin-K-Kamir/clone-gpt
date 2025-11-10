import { z } from "zod";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

const schema = z.object({
    url: z.string().url(),
    name: z.string().min(1),
    extension: z.string().min(1),
    mediaType: z.string().min(1),
});

export function isUserFileMessagePart(
    part: ChatMessagePart,
): part is ChatMessagePart & z.infer<typeof schema> {
    const result = schema.safeParse(part);

    if (!result.success) return false;

    const prefix = `${process.env.SUPABASE_STORAGE_URL!}/${STORAGE_BUCKET.USER_FILES}/`;
    return result.data.url.startsWith(prefix);
}

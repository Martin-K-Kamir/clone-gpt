import { z } from "zod";

import { CHAT_TOOL, STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

const schema = z.object({
    type: z.literal(CHAT_TOOL.GENERATE_IMAGE),
    output: z.object({
        imageUrl: z.string().url(),
        name: z.string().min(1),
        id: z.string().min(1),
    }),
});

export function isGenerateImageToolPart(
    part: ChatMessagePart,
): part is ChatMessagePart & z.infer<typeof schema> {
    const result = schema.safeParse(part);
    if (!result.success) return false;

    const prefix = `${process.env.SUPABASE_STORAGE_URL!}/${STORAGE_BUCKET.GENERATED_IMAGES}/`;
    return result.data.output.imageUrl.startsWith(prefix);
}

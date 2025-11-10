import { z } from "zod";

import { CHAT_TOOL, STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

const generateFileToolPartSchema = z.object({
    type: z.literal(CHAT_TOOL.GENERATE_FILE),
    output: z.object({
        fileUrl: z.string().url(),
        name: z.string().min(1),
        extension: z.string().optional(),
    }),
});

export function isGenerateFileToolPart(
    part: ChatMessagePart,
): part is ChatMessagePart & z.infer<typeof generateFileToolPartSchema> {
    const result = generateFileToolPartSchema.safeParse(part);
    if (!result.success) return false;

    const prefix = `${process.env.SUPABASE_STORAGE_URL!}/${STORAGE_BUCKET.GENERATED_FILES}/`;
    return result.data.output.fileUrl.startsWith(prefix);
}

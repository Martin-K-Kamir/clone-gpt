import { z } from "zod";

import type {
    WithFileId,
    WithOptionalContainerId,
} from "@/features/chat/lib/types/props";

import type { WithFilename } from "@/lib/types";

const fileCitationSchema = z.object({
    type: z.literal("container_file_citation"),
    file_id: z.string(),
    filename: z.string(),
    container_id: z.string().optional(),
});

const messageContentSchema = z.object({
    type: z.literal("output_text"),
    annotations: z.array(z.unknown()).optional(),
});

const messageOutputSchema = z.object({
    type: z.literal("message"),
    content: z.array(messageContentSchema),
});

export function findFileCitation(
    outputs: unknown[],
): (WithFilename & WithFileId & WithOptionalContainerId) | null {
    for (let i = 0; i < outputs.length; i++) {
        const messageResult = messageOutputSchema.safeParse(outputs[i]);
        if (!messageResult.success) continue;

        const { content } = messageResult.data;

        for (let j = 0; j < content.length; j++) {
            const contentItem = content[j];
            if (!contentItem.annotations) continue;

            const { annotations } = contentItem;

            for (let k = 0; k < annotations.length; k++) {
                const citationResult = fileCitationSchema.safeParse(
                    annotations[k],
                );

                if (citationResult.success) {
                    return {
                        filename: citationResult.data.filename,
                        fileId: citationResult.data.file_id,
                        containerId: citationResult.data.container_id,
                    };
                }
            }
        }
    }
    return null;
}

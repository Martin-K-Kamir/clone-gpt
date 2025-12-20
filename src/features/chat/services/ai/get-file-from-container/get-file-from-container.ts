import type { WithContainerId, WithFileId } from "@/features/chat/lib/types";

export async function getFileFromContainer({
    containerId,
    fileId,
}: WithContainerId & WithFileId): Promise<Buffer> {
    const containerFile = await fetch(
        `https://api.openai.com/v1/containers/${containerId}/files/${fileId}/content`,
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        },
    );

    if (!containerFile.ok) {
        throw new Error(`Failed to download file: ${containerFile.statusText}`);
    }

    const arrayBuffer = await containerFile.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

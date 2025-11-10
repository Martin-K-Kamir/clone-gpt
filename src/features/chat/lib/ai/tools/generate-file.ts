import { tool } from "ai";
import { z } from "zod";

import { GENERATE_FILE_SUPPORTED_EXTENSIONS } from "@/features/chat/lib/constants/ai";
import type { DBChatId } from "@/features/chat/lib/types";
import {
    findFileCitation,
    getFileGenerationHandler,
} from "@/features/chat/lib/utils";
import {
    generateCodeContent,
    getFileFromContainer,
    runCodeInterpretation,
} from "@/features/chat/services/ai";
import { storeGeneratedFile } from "@/features/chat/services/storage";

import type { DBUserId } from "@/features/user/lib/types";

import {
    getContentTypeFromExtension,
    getFileExtension,
    removeFileExtension,
} from "@/lib/utils";

const inputSchema = z.object({
    filename: z
        .string()
        .describe("The name of the file (e.g., 'report.pdf' or 'script.ts')"),
    prompt: z
        .string()
        .describe("The content or instruction for what to put in the file"),
});

type Input = z.infer<typeof inputSchema>;

export const generateFile = ({
    chatId,
    userId,
}: {
    chatId: DBChatId;
    userId: DBUserId;
}) => {
    return tool({
        inputSchema,
        description: `Generate files. For code files (TS, JS, PY, etc.), generates source code directly. For other files (PDF, DOCX, CSV, etc.), uses Python Code Interpreter to create the file. Supported formats: ${GENERATE_FILE_SUPPORTED_EXTENSIONS.join(", ")}. NOT supported: images (use generateImage tool), videos, audio files, executables.`,
        execute: async ({ filename, prompt }: Input) => {
            const result = getFileGenerationHandler(filename);

            if (!result.supported) {
                throw new Error(
                    result.reason +
                        (result.suggestion ? `. ${result.suggestion}` : ""),
                );
            }

            const extension = getFileExtension(filename);
            const name = removeFileExtension(filename);

            let buffer: Buffer<ArrayBufferLike>;

            if (result.handler === "generateCode") {
                const content = await generateCodeContent({
                    filename,
                    prompt,
                });

                buffer = Buffer.from(content, "utf8");
            } else if (result.handler === "interpretCode") {
                const response = await runCodeInterpretation({
                    prompt,
                    filename,
                });

                const fileCitation = response.output
                    ? findFileCitation(response.output)
                    : null;

                if (!fileCitation?.fileId || !fileCitation.containerId) {
                    throw new Error(
                        `Could not find file ID or container ID in code interpreter result. Make sure the file "${filename}" was created.`,
                    );
                }

                buffer = await getFileFromContainer({
                    containerId: fileCitation.containerId,
                    fileId: fileCitation.fileId,
                });
            } else {
                throw new Error(`Unsupported handler type: ${result.handler}`);
            }

            const contentType =
                getContentTypeFromExtension(extension) ||
                `application/${extension}`;

            const { fileUrl, fileId } = await storeGeneratedFile({
                chatId,
                userId,
                extension,
                name,
                contentType,
                generatedFile: buffer,
            });

            return {
                fileUrl,
                extension,
                name: filename,
                id: fileId,
                size: buffer.length,
            };
        },
    });
};

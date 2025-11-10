import { openai } from "@ai-sdk/openai";
import { experimental_generateImage, tool } from "ai";
import { z } from "zod";

import type { DBChatId } from "@/features/chat/lib/types";
import { storeGeneratedImage } from "@/features/chat/services/storage";

import type { DBUserId } from "@/features/user/lib/types";

const inputSchema = z.object({
    prompt: z.string().describe("The prompt to generate the image from"),
    name: z.string().describe("The name of the image"),
    size: z
        .enum(["1024x1024", "1024x1792", "1792x1024"])
        .describe("The size of the image")
        .default("1024x1024"),
});

type Input = z.infer<typeof inputSchema>;

export const generateImage = ({
    chatId,
    userId,
}: {
    chatId: DBChatId;
    userId: DBUserId;
}) => {
    return tool({
        inputSchema,
        description: "Generate an image",
        execute: async ({ prompt, size, name }: Input, { abortSignal }) => {
            const { image } = await experimental_generateImage({
                model: openai.imageModel("dall-e-3"),
                size,
                prompt,
                abortSignal,
            });

            const storedImage = await storeGeneratedImage({
                name,
                generatedImage: image,
                chatId,
                userId,
            });

            return {
                size,
                name,
                imageUrl: storedImage.imageUrl,
                id: storedImage.imageId,
            };
        },
    });
};

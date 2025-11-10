import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText } from "ai";
import OpenAI from "openai";

import { GENERATE_CODE_SUPPORTED_EXTENSIONS } from "@/features/chat/lib/constants/ai";
import type {
    UIChatMessage,
    WithContainerId,
    WithFileId,
} from "@/features/chat/lib/types";

import { LOCAL_ENV } from "@/lib/constants";
import type { WithFilename, WithPrompt } from "@/lib/types";

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatTitle(messages: UIChatMessage[]) {
    try {
        const result = await generateText({
            messages: convertToModelMessages(messages),
            model: openai("gpt-4o"),
            system: "You are a helpful assistant that creates short, descriptive chat titles. Summarize the following conversation in 3-5 words. Use title case. No quotes or punctuation.",
            temperature: 0.5,
            maxOutputTokens: 20,
        });

        return result.text.trim();
    } catch (error) {
        if (LOCAL_ENV) {
            console.error(`Failed to generate chat title: ${error}`);
        }

        return null;
    }
}

export async function generateCodeContent({
    filename,
    prompt,
}: WithFilename & WithPrompt) {
    try {
        const response = await generateText({
            model: openai("gpt-4o"),
            system: `
                You are a code generation assistant. Generate ONLY working, executable code.
                Supported languages: ${GENERATE_CODE_SUPPORTED_EXTENSIONS.join(", ")}.
                
                Requirements:
                - Output raw code only (no markdown code fences, no explanatory text)
                - Inline comments within the code are allowed and encouraged for clarity
                - Do NOT include docstrings, block comments explaining what the code does, or any text outside the code itself
                - Code must be immediately executable without modification
            `,
            prompt: `Generate the source code for a file named "${filename}" based on this requirement:\n${prompt}`,
        });

        return response.text
            .trim()
            .replace(/^```[\w]*\n?/gm, "") // Remove opening code fences with optional language identifier
            .replace(/```\n?$/gm, "") // Remove closing code fences
            .trim();
    } catch (error) {
        if (LOCAL_ENV) {
            console.error(`Failed to generate code content: ${error}`);
        }

        throw error;
    }
}

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

export async function runCodeInterpretation({
    filename,
    prompt,
}: WithFilename & WithPrompt) {
    return await openaiClient.responses.create({
        model: "gpt-4o",
        tools: [
            {
                type: "code_interpreter",
                container: { type: "auto" },
            },
        ],
        instructions: `You are a code execution assistant. Execute Python code ONLY. Do not provide explanations or additional text. Just run the code that creates the file "${filename}".`,
        input: `Execute Python code to create a file named "${filename}" with the following requirement:\n${prompt}\n\nSave the file with the exact filename "${filename}".`,
    });
}

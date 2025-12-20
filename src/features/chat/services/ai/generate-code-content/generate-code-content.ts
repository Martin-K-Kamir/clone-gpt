import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { GENERATE_CODE_SUPPORTED_EXTENSIONS } from "@/features/chat/lib/constants/ai";

import { LOCAL_ENV } from "@/lib/constants";
import type { WithFilename, WithPrompt } from "@/lib/types";

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

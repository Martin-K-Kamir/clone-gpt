import OpenAI from "openai";

import type { WithFilename, WithPrompt } from "@/lib/types";

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

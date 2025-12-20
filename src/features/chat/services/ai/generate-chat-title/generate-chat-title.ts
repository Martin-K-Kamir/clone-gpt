import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText } from "ai";

import type { UIChatMessage } from "@/features/chat/lib/types";

import { LOCAL_ENV } from "@/lib/constants";

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

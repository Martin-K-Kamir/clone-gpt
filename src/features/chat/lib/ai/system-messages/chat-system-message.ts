import { Geo } from "@vercel/functions";

import {
    characteristicsInstructions,
    chatFormattingInstructions,
    personalityInstructions,
    toolsInstructions,
    userGeolocationInstructions,
    userInformationInstructions,
} from "@/features/chat/lib/ai/instructions";

import type { DBUserChatPreferences } from "@/features/user/lib/types";

export function chatSystemMessage(
    userChatPreferences: DBUserChatPreferences | null,
    userGeolocation: Geo,
) {
    const systemMessage = `
        You are a helpful assistant.

        ${personalityInstructions(userChatPreferences)}
        ${characteristicsInstructions(userChatPreferences)}
        ${userInformationInstructions(userChatPreferences)}
        ${userGeolocationInstructions(userGeolocation)}
        ${toolsInstructions()}
        ${chatFormattingInstructions()}

        - Focus first on clarity, style, and readability, then provide factual accuracy or tool data.
        - Always acknowledge the user's request before responding.
        - When relevant, suggest 1-2 ways the user could improve their request or get more precise results.
        - Ensure tone, personality, and behavioral preferences are consistent throughout your responses.
    `.trim();

    return systemMessage;
}

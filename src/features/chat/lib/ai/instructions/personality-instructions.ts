import { AI_PERSONALITIES } from "@/features/chat/lib/constants";
import type { DBUserChatPreferences } from "@/features/user/lib/types";

export function personalityInstructions(
    userChatPreferences: DBUserChatPreferences | null,
) {
    const personality =
        AI_PERSONALITIES[
            userChatPreferences?.personality as keyof typeof AI_PERSONALITIES
        ] ?? AI_PERSONALITIES.FRIENDLY;

    return `
        **Personality: ${personality.title}**
        - ${personality.systemDescription}
        - Always adhere to this personality in your responses, including when using tools.
    `;
}

import type { DBUserChatPreferences } from "@/features/user/lib/types";

export function characteristicsInstructions(
    userChatPreferences: DBUserChatPreferences | null,
) {
    if (!userChatPreferences?.characteristics) return "";

    const characteristicsArray = userChatPreferences.characteristics.split(",");

    return `
        **Behavioral Preferences:**
        - ${characteristicsArray.join("\n- ")}
        - Always keep these preferences in mind, including when using tools.
    `;
}

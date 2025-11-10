import type { DBUserChatPreferences } from "@/features/user/lib/types";

export function userInformationInstructions(
    userChatPreferences: DBUserChatPreferences | null,
) {
    const { nickname, role, extraInfo } = userChatPreferences ?? {};

    if (!nickname && !role && !extraInfo) return "";

    return `
        **User Information:**
        ${nickname ? `- Nickname: ${nickname}` : ""}
        ${role ? `- Role: ${role}` : ""}
        ${extraInfo ? `- Additional info: ${extraInfo}` : ""}
        - Only mention user info if directly relevant to their question.
        - Never fabricate user details.
    `;
}

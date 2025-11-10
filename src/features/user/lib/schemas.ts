import { z } from "zod";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";
import type { AIPersonality } from "@/features/chat/lib/types";
import { USER_ROLES_LIST } from "@/features/user/lib/constants/user-roles";

export const userChatPreferenceSchema = z.object({
    nickname: z
        .string()
        .max(25, { message: "Nickname must be 25 characters or less" })
        .optional(),
    role: z
        .string()
        .max(50, { message: "Role must be 50 characters or less" })
        .optional(),
    extraInfo: z
        .string()
        .max(150, { message: "Additional info must be 150 characters or less" })
        .optional(),
    personality: z.enum(
        Object.values(AI_PERSONALITIES).map(p => p.id) as [
            AIPersonality,
            ...AIPersonality[],
        ],
    ),
    characteristics: z
        .string()
        .max(150, { message: "Characteristics must be 150 characters or less" })
        .optional(),
});

export const userRoleSchema = z.enum(USER_ROLES_LIST);

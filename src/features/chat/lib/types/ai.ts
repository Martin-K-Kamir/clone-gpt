import {
    AI_CHARACTERISTICS,
    AI_PERSONALITIES,
    CHAT_TOOLS_KEYS,
    CHAT_TRIGGERS,
} from "@/features/chat/lib/constants";

import type { Enums } from "@/lib/types";

export type ChatTool = (typeof CHAT_TOOLS_KEYS)[number];
export type ChatTrigger = (typeof CHAT_TRIGGERS)[number];

export type AIPersonality = Enums<"aiPersonality">;
export type AIPersonalityValue = (typeof AI_PERSONALITIES)[AIPersonality];
export type AICharacteristic = keyof typeof AI_CHARACTERISTICS;
export type AICharacteristicValue =
    (typeof AI_CHARACTERISTICS)[AICharacteristic];

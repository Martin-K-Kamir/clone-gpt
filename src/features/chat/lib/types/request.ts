import type { DBUserChatPreferences } from "@/features/user/lib/types";

import type { ChatTrigger } from "./ai";
import type { ChatRole } from "./chat";
import type { DBChatId, DBChatMessageId } from "./db";
import type { UIChatMessage } from "./message";

export type ChatRequestBody = {
    newChatId?: DBChatId;
    message: UIChatMessage;
    userChatPreferences: DBUserChatPreferences | null;
    chatId: DBChatId;
    trigger: ChatTrigger;
    messageId?: DBChatMessageId;
    body: {
        regeneratedMessageRole?: ChatRole;
    };
};

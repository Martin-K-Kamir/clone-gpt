import { Geo } from "@vercel/functions";
import { InferUITools } from "ai";

import { generateFile } from "@/features/chat/lib/ai/tools/generate-file";
import { generateImage } from "@/features/chat/lib/ai/tools/generate-image";
import { getWeather } from "@/features/chat/lib/ai/tools/get-weather";
import { webSearch } from "@/features/chat/lib/ai/tools/web-search";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

export type ChatTools = InferUITools<
    Omit<ReturnType<typeof chatTools>, "webSearch">
>;

export const chatTools = ({
    chatId,
    userId,
    geolocation,
}: {
    chatId: DBChatId;
    userId: DBUserId;
    geolocation: Geo;
}) => {
    return {
        getWeather,
        generateImage: generateImage({ chatId, userId }),
        generateFile: generateFile({ chatId, userId }),
        webSearch: webSearch({ geolocation }),
    } as const;
};

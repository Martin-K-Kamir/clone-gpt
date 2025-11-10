import { Geo } from "@vercel/functions";
import { InferUITools } from "ai";

import type { DBChatId } from "@/features/chat/lib/types";
import type { DBUserId } from "@/features/user/lib/types";

import { generateFile } from "./generate-file";
import { generateImage } from "./generate-image";
import { getWeather } from "./get-weather";
import { webSearch } from "./web-search";

export type ChatTools = InferUITools<ReturnType<typeof chatTools>>;

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

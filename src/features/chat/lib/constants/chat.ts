import type { DBChatVisibility } from "@/features/chat/lib/types";

import {
    CODE_FILE_EXTENSIONS_LIST,
    IMAGE_MIME_TYPES_LIST,
    MIME_TYPE,
    TEXT_FILE_EXTENSIONS_LIST,
} from "@/lib/constants";
import { objectValuesToTuple } from "@/lib/utils";

export const CHAT_UPLOAD_SUPPORTED_MIME_TYPES = [
    MIME_TYPE.PDF,
    ...IMAGE_MIME_TYPES_LIST,
] as const;

export const CHAT_TOOL = {
    GET_WEATHER: "tool-getWeather",
    GENERATE_IMAGE: "tool-generateImage",
    GENERATE_FILE: "tool-generateFile",
    WEB_SEARCH: "tool-webSearch",
} as const;

export const CHAT_TOOLS_KEYS = objectValuesToTuple(CHAT_TOOL);

export const CHAT_MESSAGE_TYPE = {
    FILE: "file",
    TEXT: "text",
    IMAGE: "image",
} as const;

export const CHAT_MESSAGE_TYPES = objectValuesToTuple(CHAT_MESSAGE_TYPE);

export const CHAT_TRIGGER = {
    REGENERATE_MESSAGE: "regenerate-message",
    SUBMIT_MESSAGE: "submit-message",
} as const;

export const CHAT_TRIGGERS = objectValuesToTuple(CHAT_TRIGGER);

export const CHAT_ROLE = {
    USER: "user",
    ASSISTANT: "assistant",
} as const;

export const CHAT_ROLES = objectValuesToTuple(CHAT_ROLE);

export const CHAT_VISIBILITY = {
    PUBLIC: "public",
    PRIVATE: "private",
} as const satisfies Record<Uppercase<DBChatVisibility>, DBChatVisibility>;

export const CHAT_VISIBILITY_VALUES = objectValuesToTuple(CHAT_VISIBILITY);

export const CHAT_ACCEPTED_FILES = [
    ...CHAT_UPLOAD_SUPPORTED_MIME_TYPES,
    ...CODE_FILE_EXTENSIONS_LIST,
    ...TEXT_FILE_EXTENSIONS_LIST,
] as const;

export const CHAT_ACCEPTED_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const CHAT_CHARACTER_MIN_LIMIT = 3;
export const CHAT_CHARACTER_MAX_LIMIT = 5_000;
export const CHAT_FILES_MAX_LIMIT = 5;

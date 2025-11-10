import { objectValuesToTuple } from "@/lib/utils";

export const RATE_LIMIT_REASON = {
    MESSAGES: "messages",
    TOKENS: "tokens",
    FILES: "files",
} as const;

export const RATE_LIMIT_REASONS_LIST = objectValuesToTuple(RATE_LIMIT_REASON);

import type { RateLimitResult } from "@/lib/types";

export type UserEntitlements = {
    maxTokens: number;
    maxMessages: number;
    maxFiles: number;
};

export type UserEntitlementLimit = keyof UserEntitlements;

export type UserFilesRateLimitResult = RateLimitResult<{
    filesCounter: number;
}>;

export type UserMessagesRateLimitResult = RateLimitResult<{
    tokensCounter: number;
    messagesCounter: number;
}>;

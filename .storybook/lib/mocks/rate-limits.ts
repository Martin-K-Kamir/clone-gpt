import type {
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "../../../src/features/user/lib/types";
import { FIXED_DATE, FIXED_DATE_STRING } from "./chats";

export const FIXED_DATE_PLUS_24H = new Date(
    FIXED_DATE.getTime() + 24 * 60 * 60 * 1000,
).toISOString();

export function createMockMessagesRateLimit(overrides?: {
    isOverLimit?: boolean;
    reason?: "messages";
    periodStart?: string;
    periodEnd?: string;
    messagesCounter?: number;
    tokensCounter?: number;
    hoursOffset?: number;
}): UserMessagesRateLimitResult {
    const periodStart = overrides?.periodStart ?? FIXED_DATE_STRING;
    const periodEnd =
        overrides?.periodEnd ??
        new Date(
            FIXED_DATE.getTime() +
                (overrides?.hoursOffset ?? 24) * 60 * 60 * 1000,
        ).toISOString();

    return {
        isOverLimit: overrides?.isOverLimit ?? true,
        reason: overrides?.reason ?? "messages",
        periodStart,
        periodEnd,
        messagesCounter: overrides?.messagesCounter ?? 100,
        tokensCounter: overrides?.tokensCounter ?? 50000,
    } as UserMessagesRateLimitResult;
}

export function createMockFilesRateLimit(overrides?: {
    isOverLimit?: boolean;
    reason?: "files";
    periodStart?: string;
    periodEnd?: string;
    filesCounter?: number;
    hoursOffset?: number;
}): UserFilesRateLimitResult {
    const periodStart = overrides?.periodStart ?? FIXED_DATE_STRING;
    const periodEnd =
        overrides?.periodEnd ??
        new Date(
            FIXED_DATE.getTime() +
                (overrides?.hoursOffset ?? 24) * 60 * 60 * 1000,
        ).toISOString();

    return {
        isOverLimit: overrides?.isOverLimit ?? true,
        reason: overrides?.reason ?? "files",
        periodStart,
        periodEnd,
        filesCounter: overrides?.filesCounter ?? 10,
    } as UserFilesRateLimitResult;
}

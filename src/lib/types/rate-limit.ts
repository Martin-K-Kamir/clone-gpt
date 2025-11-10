import { RATE_LIMIT_REASONS_LIST } from "@/lib/constants";

export type RateLimitReason = (typeof RATE_LIMIT_REASONS_LIST)[number];

export type RateLimitResult<TCounters extends Record<string, number>> = (
    | {
          isOverLimit: true;
          reason: RateLimitReason;
          periodStart: string;
          periodEnd: string;
      }
    | {
          isOverLimit: false;
      }
) & {
    [K in keyof TCounters]: TCounters[K];
};

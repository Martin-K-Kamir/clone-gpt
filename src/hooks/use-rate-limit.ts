"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { RateLimitError } from "@/lib/classes";
import { RateLimitResult } from "@/lib/types";

export type UseRateLimitProps<TCounters extends Record<string, number>> = {
    queryKey: unknown[];
    queryFn: () => Promise<RateLimitResult<TCounters>>;
    reasons: readonly string[];
    errorToSync?: Error;
    onLimitExceeded?: (result: RateLimitResult<TCounters>) => void;
    onLimitAvailable?: (result: RateLimitResult<TCounters>) => void;
    onPeriodReset?: () => void;
};

export function useRateLimit<TCounters extends Record<string, number>>({
    queryKey,
    queryFn,
    reasons,
    errorToSync,
    onLimitExceeded,
    onLimitAvailable,
    onPeriodReset,
}: UseRateLimitProps<TCounters>) {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey,
        queryFn,
    });

    useEffect(() => {
        if (!query.data) {
            return;
        }

        if (query.data.isOverLimit) {
            onLimitExceeded?.(query.data);
        } else {
            onLimitAvailable?.(query.data);
        }
    }, [query.data, onLimitExceeded, onLimitAvailable]);

    useEffect(() => {
        if (!query.data || !query.data.isOverLimit) {
            return;
        }

        const periodEnd = new Date(query.data.periodEnd);
        const now = new Date();
        const timeUntilPeriodEnd = periodEnd.getTime() - now.getTime();

        if (timeUntilPeriodEnd <= 0) {
            return;
        }

        const timeoutId = setTimeout(() => {
            query.refetch();
            onPeriodReset?.();
        }, timeUntilPeriodEnd);

        return () => clearTimeout(timeoutId);
    }, [query, query.data, query.refetch, onPeriodReset]);

    useEffect(() => {
        if (
            errorToSync instanceof RateLimitError &&
            reasons.includes(errorToSync.reason)
        ) {
            queryClient.setQueryData(queryKey, {
                isOverLimit: true,
                periodEnd: errorToSync.periodEnd.toISOString(),
                periodStart: errorToSync.periodStart.toISOString(),
                reason: errorToSync.reason,
            });
        } else {
            queryClient.setQueryData(queryKey, undefined);
        }
    }, [errorToSync, queryClient, queryKey, reasons]);

    return query;
}

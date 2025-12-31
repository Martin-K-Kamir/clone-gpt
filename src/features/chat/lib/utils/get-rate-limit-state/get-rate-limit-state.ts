import type {
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";

type RateLimitConfig = {
    message: string;
    data: UserMessagesRateLimitResult | UserFilesRateLimitResult | undefined;
};

type ExceededRateLimitConfig = {
    message: string;
    data: Extract<
        UserMessagesRateLimitResult | UserFilesRateLimitResult,
        { isOverLimit: true }
    >;
};

export function getRateLimitState(rateLimitConfigs: RateLimitConfig[]) {
    const exceededLimits = rateLimitConfigs.filter(
        (config): config is ExceededRateLimitConfig =>
            config.data !== undefined && config.data.isOverLimit === true,
    );

    if (exceededLimits.length === 0) {
        return null;
    }

    const latestResetTime = exceededLimits.reduce((latest, config) => {
        const currentDate = new Date(config.data.periodEnd);
        const latestDate = new Date(latest);
        return currentDate > latestDate ? config.data.periodEnd : latest;
    }, exceededLimits[0].data.periodEnd);

    let message: string;
    if (exceededLimits.length === 1) {
        message = exceededLimits[0].message;
    } else {
        message = "Daily limits reached. Try again after {periodEnd}.";
    }

    return {
        message,
        periodEnd: latestResetTime,
    };
}

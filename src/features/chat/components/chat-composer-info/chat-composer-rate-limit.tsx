"use client";

import { useEffect, useMemo, useState } from "react";

import { getRateLimitState } from "@/features/chat/lib/utils";
import {
    useChatFilesRateLimitContext,
    useChatMessagesRateLimitContext,
} from "@/features/chat/providers";

import { formatDateTime, formatTemplate } from "@/lib/utils";

import { ChatComposerInfo } from "./chat-composer-info-box";

export function ChatComposerRateLimit() {
    const { rateLimit: filesRateLimit } = useChatFilesRateLimitContext();
    const { rateLimit: messagesRateLimit } = useChatMessagesRateLimitContext();
    const [open, setOpen] = useState(false);

    const rateLimitConfigs = useMemo(
        () => [
            {
                message:
                    "Daily file upload limit reached. Try again after {periodEnd}.",
                data: filesRateLimit,
            },
            {
                message:
                    "Daily message limit reached. Try again after {periodEnd}.",
                data: messagesRateLimit,
            },
        ],
        [filesRateLimit, messagesRateLimit],
    );

    useEffect(() => {
        setOpen(
            Boolean(
                filesRateLimit?.isOverLimit || messagesRateLimit?.isOverLimit,
            ),
        );
    }, [filesRateLimit, messagesRateLimit]);

    const rateLimitState = useMemo(
        () => getRateLimitState(rateLimitConfigs),
        [rateLimitConfigs],
    );

    return (
        <ChatComposerInfo
            open={open}
            onClose={() => setOpen(false)}
            data-testid="chat-composer-rate-limit"
        >
            {rateLimitState && (
                <p>
                    {formatTemplate(rateLimitState.message, {
                        periodEnd: formatDateTime(rateLimitState.periodEnd),
                    })}
                </p>
            )}
        </ChatComposerInfo>
    );
}

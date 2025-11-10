"use client";

import { useCallback } from "react";

export type SocialPlatform = "linkedin" | "twitter" | "reddit";

type ShareData = {
    url: string;
    text: string;
};

export type PopupOptions = {
    width?: number;
    height?: number;
    scrollbars?: boolean;
    resizable?: boolean;
};

const DEFAULT_POPUP_OPTIONS: PopupOptions = {
    width: 600,
    height: 400,
    scrollbars: true,
    resizable: true,
};

export function useSocialShare() {
    const getShareUrl = useCallback(
        (platform: SocialPlatform, data: ShareData) => {
            const { url, text } = data;

            if (platform === "linkedin") {
                const params = new URLSearchParams({
                    linkOrigin: "LL_BADGE",
                    shareActive: "true",
                    shareUrl: url,
                    text,
                });

                return `https://www.linkedin.com/feed/?${params.toString()}`;
            }

            if (platform === "twitter") {
                const params = new URLSearchParams({
                    text: `${text}\n`,
                    url,
                });
                return `https://twitter.com/intent/tweet?${params.toString()}`;
            }

            if (platform === "reddit") {
                const params = new URLSearchParams({
                    url,
                    title: text,
                });
                return `https://reddit.com/submit?${params.toString()}`;
            }

            const _exhaustiveCheck: never = platform;
            throw new Error(`Exhaustive check failed: ${_exhaustiveCheck}`);
        },
        [],
    );

    const openSharePopup = useCallback(
        (platform: SocialPlatform, data: ShareData, options?: PopupOptions) => {
            const mergedOptions = {
                ...DEFAULT_POPUP_OPTIONS,
                ...options,
            };

            const popupOptionsString = Object.entries(mergedOptions)
                .map(([key, value]) => `${key}=${value}`)
                .join(",");

            const popup = window.open(
                getShareUrl(platform, data),
                `share-${platform}`,
                popupOptionsString,
            );

            if (popup) {
                popup.focus();
            }
        },
        [getShareUrl],
    );

    return { getShareUrl, openSharePopup } as const;
}

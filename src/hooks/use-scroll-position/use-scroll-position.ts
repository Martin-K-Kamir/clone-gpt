"use client";

import { useState } from "react";

import { useDebouncedEffect } from "../use-debounced-effect";
import { useEventListener } from "../use-event-listener";

type UseScrollPositionOptions = {
    threshold?: number;
    debounceMs?: number;
};

export function useScrollPosition<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
    initialValue?: boolean,
    options?: UseScrollPositionOptions,
) {
    const { threshold = 10, debounceMs = 50 } = options || {};
    const [isAtBottom, setIsAtBottom] = useState(initialValue);
    const [isAtTop, setIsAtTop] = useState(initialValue);

    const checkPosition = () => {
        const container = ref.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        setIsAtBottom(isBottom);
        setIsAtTop(scrollTop === 0);
    };

    useEventListener("scroll", checkPosition, ref.current ?? null, {
        passive: true,
    });

    useDebouncedEffect(
        () => {
            checkPosition();
        },
        [ref.current, threshold],
        debounceMs,
    );

    return { isAtBottom, isAtTop };
}

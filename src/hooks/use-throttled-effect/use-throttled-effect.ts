"use client";

import { useEffect, useRef } from "react";

export function useThrottledEffect(
    effect: () => void | (() => void),
    deps: unknown[],
    delay: number = 300,
) {
    const lastRan = useRef<number>(0);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cleanupRef = useRef<(() => void) | void>(undefined);

    useEffect(() => {
        const runEffect = () => {
            cleanupRef.current = effect();
            lastRan.current = Date.now();
        };

        const now = Date.now();
        const timeSinceLastRun = now - lastRan.current;

        if (timeSinceLastRun >= delay) {
            runEffect();
        } else {
            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                runEffect();
            }, delay - timeSinceLastRun);
        }

        return () => {
            if (timeout.current) clearTimeout(timeout.current);
            if (typeof cleanupRef.current === "function") {
                cleanupRef.current();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delay]);
}

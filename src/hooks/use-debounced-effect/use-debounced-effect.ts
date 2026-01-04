"use client";

import { useEffect, useRef } from "react";

export function useDebouncedEffect(
    effect: () => void | (() => void),
    deps: unknown[],
    delay: number,
) {
    const cleanupRef = useRef<(() => void) | void>(undefined);

    useEffect(() => {
        const handler = setTimeout(() => {
            cleanupRef.current = effect();
        }, delay);

        return () => {
            clearTimeout(handler);
            if (typeof cleanupRef.current === "function") {
                cleanupRef.current();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delay]);
}

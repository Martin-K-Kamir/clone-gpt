"use client";

import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
    ref: React.RefObject<T | null>,
    callback: (event: PointerEvent) => void,
    options?: boolean | AddEventListenerOptions,
) {
    useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                event.isClickOutside = true;
                callback(event);
            }
        }

        document.addEventListener("pointerdown", handleClickOutside, options);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleClickOutside,
                options,
            );
        };
    }, [ref, callback, options]);
}

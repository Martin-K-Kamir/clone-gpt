"use client";

import { useLayoutEffect, useState } from "react";

type UseScrollbarSizeOptions = {
    cssVariableName?: string;
    skipState?: boolean;
};

export function useScrollbarSize<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
    options?: UseScrollbarSizeOptions,
) {
    const { cssVariableName = "--scrollbar-size", skipState = false } =
        options || {};

    const [scrollbarSize, setScrollbarSize] = useState(0);

    useLayoutEffect(() => {
        function checkScrollbar() {
            if (!ref.current) {
                if (!skipState) setScrollbarSize(0);
                document.documentElement.style.removeProperty(cssVariableName);
                return;
            }

            const el = ref.current;
            const hasVerticalScrollbar = el.scrollHeight > el.clientHeight;
            const size = hasVerticalScrollbar
                ? el.offsetWidth - el.clientWidth
                : 0;

            if (!skipState) {
                setScrollbarSize(size);
            }

            if (size > 0) {
                document.documentElement.style.setProperty(
                    cssVariableName,
                    `${size}px`,
                );
            } else {
                document.documentElement.style.removeProperty(cssVariableName);
            }
        }

        checkScrollbar();

        window.addEventListener("resize", checkScrollbar);
        return () => window.removeEventListener("resize", checkScrollbar);
    }, [ref, cssVariableName, skipState]);

    return skipState ? undefined : scrollbarSize;
}

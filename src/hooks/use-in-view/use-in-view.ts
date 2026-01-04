"use client";

import { useEffect, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
    triggerOnce?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
}

export function useInView<TElement extends Element>(
    ref: React.RefObject<TElement | null>,
    options: UseInViewOptions = {},
) {
    const {
        triggerOnce = false,
        threshold = 0,
        root = null,
        rootMargin = "0px",
        onEnter,
        onLeave,
    } = options;

    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry.isIntersecting;

                if (isIntersecting) {
                    if (!inView) {
                        onEnter?.();
                        setInView(true);
                    }
                    if (triggerOnce) {
                        observer.disconnect();
                    }
                } else {
                    if (inView && !triggerOnce) {
                        onLeave?.();
                        setInView(false);
                    }
                }
            },
            { threshold, root, rootMargin },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [
        ref,
        threshold,
        root,
        rootMargin,
        triggerOnce,
        onEnter,
        onLeave,
        inView,
    ]);

    return inView;
}

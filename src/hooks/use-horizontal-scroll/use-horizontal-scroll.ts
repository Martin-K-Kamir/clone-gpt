"use client";

import { useEffect, useRef, useState } from "react";

export function useHorizontalScroll<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
) {
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const [canScroll, setCanScroll] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (!ref.current) {
                setCanScroll(false);
                return;
            }

            const hasOverflow =
                ref.current.scrollWidth > ref.current.clientWidth;
            setCanScroll(hasOverflow);
        };

        checkOverflow();

        const element = ref.current;
        if (!element) return;

        // Check overflow on resize
        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(element);

        // Also check when content changes (e.g., children added/removed)
        const mutationObserver = new MutationObserver(checkOverflow);
        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class"],
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [ref]);

    const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
        if (!canScroll) return;
        e.preventDefault();
        const container = e.currentTarget;
        container.scrollLeft += e.deltaY;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        if (!canScroll || !ref.current) return;

        isDragging.current = true;
        startX.current = e.pageX - ref.current.offsetLeft;
        scrollLeft.current = ref.current.scrollLeft;

        ref.current.style.cursor = "grabbing";

        e.preventDefault();
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if (ref.current) {
            ref.current.style.cursor = canScroll ? "grab" : "default";
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (ref.current) {
            ref.current.style.cursor = canScroll ? "grab" : "default";
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!isDragging.current || !ref.current || !canScroll) return;

        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        ref.current.scrollLeft = scrollLeft.current - walk;
    };

    return {
        onWheel: handleWheel,
        onMouseDown: handleMouseDown,
        onMouseLeave: handleMouseLeave,
        onMouseUp: handleMouseUp,
        onMouseMove: handleMouseMove,
        canScroll,
    };
}

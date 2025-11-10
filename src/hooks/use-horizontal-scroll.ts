"use client";

import { useRef } from "react";

export function useHorizontalScroll<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
) {
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
        e.preventDefault();
        const container = e.currentTarget;
        container.scrollLeft += e.deltaY;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        if (!ref.current) return;

        isDragging.current = true;
        startX.current = e.pageX - ref.current.offsetLeft;
        scrollLeft.current = ref.current.scrollLeft;

        ref.current.style.cursor = "grabbing";

        e.preventDefault();
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if (ref.current) {
            ref.current.style.cursor = "grab";
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (ref.current) {
            ref.current.style.cursor = "grab";
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!isDragging.current || !ref.current) return;

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
    };
}

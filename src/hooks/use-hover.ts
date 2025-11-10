"use client";

import { RefObject, useEffect, useState } from "react";

type UseHoverOptions = {
    onEnter?: () => void;
    onLeave?: () => void;
};

export function useHover<T extends HTMLElement>(
    ref: RefObject<T | null>,
    options: UseHoverOptions = {},
): boolean {
    const { onEnter, onLeave } = options;
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const handleMouseEnter = () => {
            setIsHovered(true);
            onEnter?.();
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            onLeave?.();
        };

        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            node.removeEventListener("mouseenter", handleMouseEnter);
            node.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [ref, onEnter, onLeave]);

    return isHovered;
}

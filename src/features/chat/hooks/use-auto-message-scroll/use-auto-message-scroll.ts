"use client";

import { ChatStatus } from "ai";
import { RefObject, useLayoutEffect, useMemo, useRef } from "react";

import { throttle } from "@/lib/utils";

import { useEventListener, useThrottledEffect } from "@/hooks";

type UseAutoMessageScrollProps<TElement extends HTMLElement = HTMLElement> = {
    lastMessageRef: RefObject<TElement | null>;
    containerRef: RefObject<TElement | null>;
    messages: unknown[];
    status: ChatStatus;
};

export function useAutoMessageScroll<
    TElement extends HTMLElement = HTMLElement,
>({
    lastMessageRef,
    containerRef,
    messages,
    status,
}: UseAutoMessageScrollProps<TElement>) {
    const autoScrollEnabledRef = useRef(true);

    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef?.current?.scrollTo({
                top: containerRef?.current?.scrollHeight,
            });
        }
    }, [lastMessageRef, containerRef]);

    const throttledScrollHandler = useMemo(() => {
        const handleScroll = () => {
            autoScrollEnabledRef.current = false;
        };

        return throttle(handleScroll, 1000);
    }, []);

    useEventListener("wheel", throttledScrollHandler, {
        passive: true,
    });
    useEventListener("touchmove", throttledScrollHandler, { passive: true });

    useThrottledEffect(
        () => {
            if (status === "submitted") {
                autoScrollEnabledRef.current = true;
            }

            if (
                autoScrollEnabledRef.current &&
                lastMessageRef.current &&
                (status === "streaming" || status === "submitted")
            ) {
                lastMessageRef.current.scrollIntoView({
                    block: "end",
                    behavior: "smooth",
                });
            }
        },
        [messages, status, lastMessageRef],
        200,
    );

    return autoScrollEnabledRef;
}

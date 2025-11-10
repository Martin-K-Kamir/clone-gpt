"use client";

import { useEffect, useRef } from "react";

type EventTargetType = HTMLElement | Document | Window;

export function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
    eventName: K,
    handler: (event: GlobalEventHandlersEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
    eventName: K,
    handler: (event: GlobalEventHandlersEventMap[K]) => void,
    element: EventTargetType | null,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element: EventTargetType | null,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
    eventName: K | string,
    handler:
        | ((event: GlobalEventHandlersEventMap[K]) => void)
        | ((event: Event) => void),
    third?: EventTargetType | boolean | AddEventListenerOptions | null,
    fourth?: boolean | AddEventListenerOptions,
) {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        let element: EventTargetType | null = null;
        let options: boolean | AddEventListenerOptions | undefined;

        if (
            third &&
            typeof (third as EventTargetType)?.addEventListener === "function"
        ) {
            element = third as EventTargetType;
            options = fourth;
        } else {
            element = null;
            options = third as boolean | AddEventListenerOptions | undefined;
        }

        const target: EventTargetType = element ?? window;

        if (!target?.addEventListener) return;

        const eventListener = (event: Event) =>
            savedHandler.current(event as GlobalEventHandlersEventMap[K]);

        target.addEventListener(eventName, eventListener, options);

        return () => {
            target.removeEventListener(eventName, eventListener, options);
        };
    }, [eventName, third, fourth]);
}

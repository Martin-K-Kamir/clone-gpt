"use client";

import { useCallback, useLayoutEffect, useState } from "react";

type UseElementDimensionsOptions = {
    name?: string;
    createCssVariables?: boolean;
    removeCssVariables?: boolean;
    updateOnResize?: boolean;
    heightCorrection?: number;
    widthCorrection?: number;
};

type UseElementDimensionsReturn = {
    width: number;
    height: number;
    updateDimensions: <E extends HTMLElement = HTMLElement>(
        element: E | null,
        options?: UseElementDimensionsOptions,
    ) => (() => void) | undefined;
    removeDimensions: (customName?: string) => void;
};

const DEFAULT_OPTIONS = {
    name: "element",
    createCssVariables: true,
    removeCssVariables: true,
    updateOnResize: false,
    heightCorrection: 0,
    widthCorrection: 0,
} as const satisfies UseElementDimensionsOptions;

export function useElementDimensions(
    options?: UseElementDimensionsOptions,
): UseElementDimensionsReturn;

export function useElementDimensions<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
    options?: UseElementDimensionsOptions,
): UseElementDimensionsReturn;

export function useElementDimensions<T extends HTMLElement = HTMLElement>(
    refOrOptions?: React.RefObject<T | null> | UseElementDimensionsOptions,
    options?: UseElementDimensionsOptions,
): UseElementDimensionsReturn {
    const isFirstArgRef = refOrOptions && "current" in refOrOptions;
    const ref = isFirstArgRef
        ? (refOrOptions as React.RefObject<T | null>)
        : null;
    const finalOptions = isFirstArgRef
        ? options
        : (refOrOptions as UseElementDimensionsOptions);

    const { name, removeCssVariables, updateOnResize } = {
        ...DEFAULT_OPTIONS,
        ...finalOptions,
    };

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const removeDimensions = useCallback(
        (customName = name) => {
            document.documentElement.style.removeProperty(
                `--${customName}-width`,
            );
            document.documentElement.style.removeProperty(
                `--${customName}-height`,
            );
        },
        [name],
    );

    const updateDimensions = useCallback(
        <E extends HTMLElement = HTMLElement>(
            element: E | null,
            customOptions?: UseElementDimensionsOptions,
        ) => {
            const {
                name,
                createCssVariables,
                heightCorrection,
                widthCorrection,
                removeCssVariables,
            } = {
                ...DEFAULT_OPTIONS,
                ...finalOptions,
                ...customOptions,
            };

            if (!element) {
                removeDimensions(name);
                return;
            }

            const rect = element.getBoundingClientRect();
            const newWidth = rect.width + widthCorrection;
            const newHeight = rect.height + heightCorrection;
            setWidth(newWidth);
            setHeight(newHeight);

            if (createCssVariables) {
                document.documentElement.style.setProperty(
                    `--${name}-width`,
                    `${newWidth}px`,
                );
                document.documentElement.style.setProperty(
                    `--${name}-height`,
                    `${newHeight}px`,
                );
            }

            return () => {
                if (!removeCssVariables) {
                    return;
                }

                removeDimensions(name);
            };
        },
        [finalOptions, removeDimensions],
    );

    useLayoutEffect(() => {
        if (!ref || !ref.current) {
            return;
        }

        updateDimensions(ref.current);

        const handleResize = () => {
            if (ref.current) {
                updateDimensions(ref.current);
            }
        };

        if (updateOnResize) {
            window.addEventListener("resize", handleResize);
        }

        return () => {
            if (updateOnResize) {
                window.removeEventListener("resize", handleResize);
            }

            if (removeCssVariables) {
                removeDimensions();
            }
        };
    }, [
        ref,
        name,
        removeCssVariables,
        updateOnResize,
        updateDimensions,
        removeDimensions,
    ]);

    return {
        width,
        height,
        updateDimensions,
        removeDimensions,
    };
}

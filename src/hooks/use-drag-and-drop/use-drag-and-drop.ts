"use client";

import { useCallback, useState } from "react";

type DragAndDropProps = {
    onDrop?: (e: React.DragEvent) => void;
    onDragEnter?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
};

export function useDragAndDrop({
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave,
}: DragAndDropProps = {}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
            onDragEnter?.(e);
        },
        [onDragEnter],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onDragOver?.(e);
        },
        [onDragOver],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOver(false);
            }

            onDragLeave?.(e);
        },
        [onDragLeave],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            onDrop?.(e);
        },
        [onDrop],
    );

    return {
        isDragOver,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    } as const;
}

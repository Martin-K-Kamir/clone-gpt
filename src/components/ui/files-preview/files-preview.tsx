"use client";

import { useRef } from "react";

import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { cn } from "@/lib/utils";

import { FilesPreviewItem } from "./files-preview-item";

export type FilesPreviewProps = {
    previewFiles: File[];
    isLoading?: boolean;
    onFileRemove?: (file: File) => void;
};

export function FilesPreview({
    previewFiles,
    className,
    isLoading,
    onFileRemove,
    ...props
}: FilesPreviewProps & React.ComponentProps<"ul">) {
    const ref = useRef<HTMLUListElement>(null);
    const { onWheel, onMouseDown, onMouseLeave, onMouseUp, onMouseMove } =
        useHorizontalScroll(ref);

    return (
        <ul
            ref={ref}
            className={cn(
                "group/files-preview scrollbar-none flex w-full cursor-grab select-none gap-3 overflow-x-auto",
                className,
            )}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            {...props}
        >
            {previewFiles.map(file => (
                <FilesPreviewItem
                    key={file.name}
                    file={file}
                    onFileRemove={onFileRemove}
                    isLoading={isLoading}
                />
            ))}
        </ul>
    );
}

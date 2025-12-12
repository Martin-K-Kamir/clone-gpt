"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

import { useHorizontalScroll } from "@/hooks";

import { FilesPreviewItem } from "./files-preview-item";

export type FilesPreviewProps = {
    previewFiles: File[];
    isLoading?: boolean;
    classNameImageWrapper?: string;
    classNameFileWrapper?: string;
    classNameImage?: string;
    classNameFile?: string;
    classNameRemoveButton?: string;
    onFileRemove?: (file: File) => void;
};

export function FilesPreview({
    previewFiles,
    isLoading,
    className,
    classNameImageWrapper,
    classNameFileWrapper,
    classNameImage,
    classNameFile,
    classNameRemoveButton,
    onFileRemove,
    ...props
}: FilesPreviewProps & React.ComponentProps<"ul">) {
    const ref = useRef<HTMLUListElement>(null);
    const {
        canScroll,
        onWheel,
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
    } = useHorizontalScroll(ref);

    return (
        <ul
            ref={ref}
            className={cn(
                "group/files-preview scrollbar-none flex w-full select-none gap-3 overflow-x-auto",
                canScroll ? "cursor-grab" : "cursor-default",
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
                    isLoading={isLoading}
                    classNameImageWrapper={classNameImageWrapper}
                    classNameFileWrapper={classNameFileWrapper}
                    classNameImage={classNameImage}
                    classNameFile={classNameFile}
                    classNameRemoveButton={classNameRemoveButton}
                    onFileRemove={onFileRemove}
                />
            ))}
        </ul>
    );
}

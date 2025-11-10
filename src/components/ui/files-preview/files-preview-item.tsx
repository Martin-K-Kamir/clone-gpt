import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { FilesPreviewFile } from "./files-preview-file";
import { FilesPreviewImage } from "./files-preview-image";

export type FilesPreviewItemProps = {
    file: File;
    isLoading?: boolean;
    classNameImageWrapper?: string;
    classNameFileWrapper?: string;
    classNameImage?: string;
    classNameFile?: string;
    classNameRemoveButton?: string;
    removeButtonProps?: Omit<
        React.ComponentProps<typeof Button>,
        "children" | "onClick" | "className"
    >;
    onFileRemove?: (file: File) => void;
} & Omit<React.ComponentProps<"li">, "children">;

export function FilesPreviewItem({
    file,
    isLoading,
    className,
    classNameImage,
    classNameFile,
    classNameImageWrapper,
    classNameFileWrapper,
    classNameRemoveButton,
    removeButtonProps,
    onFileRemove,
    ...props
}: FilesPreviewItemProps) {
    const isImage = file.type.startsWith("image/");

    return (
        <li
            className={cn(
                "group/file-preview-item relative",
                isImage ? "flex-shrink-0" : "max-w-74 w-full",
                isImage ? classNameImageWrapper : classNameFileWrapper,
                className,
            )}
            {...props}
        >
            {isImage ? (
                <FilesPreviewImage
                    file={file}
                    className={classNameImage}
                    isLoading={isLoading}
                />
            ) : (
                <FilesPreviewFile
                    file={file}
                    className={classNameFile}
                    isLoading={isLoading}
                />
            )}
            <Button
                size="icon"
                className={cn(
                    "pointer-coarse:opacity-100 absolute right-1 top-1 size-5 rounded-full opacity-0 hover:brightness-100 focus-visible:opacity-100 group-hover/file-preview-item:opacity-100 sm:right-1.5 sm:top-1.5",
                    classNameRemoveButton,
                )}
                onClick={() => onFileRemove?.(file)}
                {...removeButtonProps}
            >
                <IconX className="size-3.5" strokeWidth={2.5} />
            </Button>
        </li>
    );
}

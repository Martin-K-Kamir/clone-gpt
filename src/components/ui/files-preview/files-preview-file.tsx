import { FileBanner } from "@/components/ui/file-banner";

import { cn, getFileExtension } from "@/lib/utils";

export type FilesPreviewFileProps = {
    isLoading?: boolean;
    file: File;
    className?: string;
};

export function FilesPreviewFile({
    isLoading,
    file,
    className,
}: FilesPreviewFileProps) {
    const extension = getFileExtension(file);
    return (
        <FileBanner
            className={cn("min-w-52", className)}
            isLoading={isLoading}
            url={URL.createObjectURL(file)}
            name={file.name}
            size={file.size}
            type={extension ?? "default"}
        />
    );
}

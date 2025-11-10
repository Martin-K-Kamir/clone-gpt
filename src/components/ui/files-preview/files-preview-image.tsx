import { IconLoader2 } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export type FilesPreviewImageProps = {
    isLoading?: boolean;
    file: File;
    classNameLoading?: string;
    loadingProps?: Omit<React.ComponentProps<"div">, "children" | "className">;
} & Omit<React.ComponentProps<"div">, "children">;

export function FilesPreviewImage({
    isLoading,
    file,
    className,
    classNameLoading,
    loadingProps,
    ...props
}: FilesPreviewImageProps) {
    return (
        <div className={cn("relative", className)} {...props}>
            {isLoading && (
                <div
                    {...loadingProps}
                    className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-900/50",
                        classNameLoading,
                    )}
                >
                    <IconLoader2 className="size-7 animate-spin" />
                </div>
            )}
            <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="size-16.5 rounded-2xl object-cover"
            />
        </div>
    );
}

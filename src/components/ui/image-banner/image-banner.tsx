"use client";

import { IconDownload } from "@tabler/icons-react";
import { memo, useState } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

import { cn, downloadBlob } from "@/lib/utils";

type ImageBannerProps = {
    src: string;
    downloadName?: string;
    classNameWrapper?: string;
    classNameButton?: string;
    buttonVariant?: ButtonProps["variant"];
    buttonSize?: ButtonProps["size"];
    showDownloadButton?: boolean;
    renderDownloadButton?:
        | React.ReactNode
        | ((props: { src: string; alt?: string }) => React.ReactNode);
} & React.ComponentProps<typeof LazyImage>;

export function ImageBanner({
    src,
    alt,
    downloadName,
    renderDownloadButton,
    classNameButton,
    classNameWrapper,
    showDownloadButton = true,
    buttonVariant = "blurred",
    buttonSize = "icon",
    ...props
}: ImageBannerProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isImageError, setIsImageError] = useState(false);

    return (
        <span
            className={cn(
                "group/image-banner relative block overflow-hidden",
                classNameWrapper,
            )}
        >
            <LazyImage
                src={src}
                alt={alt ?? "Image"}
                isLoaded={isImageLoaded}
                isError={isImageError}
                onError={() => setIsImageError(true)}
                onLoad={() => setIsImageLoaded(true)}
                {...props}
            />
            {showDownloadButton && isImageLoaded && !isImageError && (
                <>
                    {typeof renderDownloadButton === "function" ? (
                        renderDownloadButton({ src, alt })
                    ) : renderDownloadButton ? (
                        renderDownloadButton
                    ) : (
                        <Button
                            variant={buttonVariant}
                            size={buttonSize}
                            className={cn(
                                "pointer-coarse:opacity-100 absolute bottom-2 right-2 z-10 size-8 opacity-0 focus-visible:opacity-100 group-hover/image-banner:opacity-100",
                                classNameButton,
                            )}
                            onClick={() =>
                                downloadBlob({
                                    src,
                                    name: downloadName,
                                })
                            }
                        >
                            <IconDownload />
                            <span className="sr-only">
                                Download {downloadName ?? "image"}
                            </span>
                        </Button>
                    )}
                    <span className="pointer-coarse:hidden pointer-events-none absolute inset-0 rounded-2xl bg-black/0 bg-gradient-to-b from-transparent via-transparent via-80% to-black/50 opacity-0 transition-opacity duration-200 group-focus-within/image-banner:opacity-100 group-hover/image-banner:opacity-100" />
                </>
            )}
        </span>
    );
}

export const MemoizedImageBanner = memo(ImageBanner);
export const HardMemoizedImageBanner = memo(ImageBanner, () => {
    return true;
});

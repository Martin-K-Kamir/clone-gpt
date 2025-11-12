"use client";

import { IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
// import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type LazyImageProps = React.ComponentProps<typeof Image> & {
    renderLoader?: React.ReactNode;
    renderError?: React.ReactNode;
    classNameLoader?: string;
    classNameError?: string;
    classNameWrapper?: string;
    isLoaded?: boolean;
    isError?: boolean;
};

export function LazyImage({
    src,
    alt,
    className,
    renderLoader,
    renderError,
    classNameLoader,
    classNameError,
    classNameWrapper,
    isLoaded: initialIsLoaded,
    isError: initialIsError,
    ...props
}: LazyImageProps) {
    // const [isLoaded, setIsLoaded] = useState(() => initialIsLoaded ?? false);
    // const [isError, setIsError] = useState(() => initialIsError ?? false);

    // useEffect(() => {
    //     setIsLoaded(initialIsLoaded ?? false);
    // }, [initialIsLoaded]);

    // useEffect(() => {
    //     setIsError(initialIsError ?? false);
    // }, [initialIsError]);

    const isLoaded = false;
    const isError = false;
    const setIsLoaded = (value: boolean) => {
        console.log(initialIsLoaded);
        console.log(initialIsError);
        console.log("setIsLoaded", value);
    };
    const setIsError = (value: boolean) => {
        console.log("setIsError", value);
    };

    return (
        <span className={cn("relative", classNameWrapper)}>
            {!isLoaded &&
                (renderLoader ? (
                    renderLoader
                ) : (
                    <span
                        className={cn(
                            "absolute grid size-full place-items-center rounded-2xl bg-zinc-800 [&_svg]:size-1/12 [&_svg]:min-h-10 [&_svg]:min-w-10 [&_svg]:animate-spin [&_svg]:text-zinc-300",
                            classNameLoader,
                        )}
                    >
                        <IconLoader2 />
                    </span>
                ))}

            {isError &&
                (renderError ? (
                    renderError
                ) : (
                    <span
                        className={cn(
                            "absolute grid size-full place-items-center rounded-2xl bg-zinc-800",
                            classNameError,
                        )}
                    >
                        <span className="flex flex-col items-center gap-1 text-rose-500">
                            <IconAlertCircle className="size-6.5" />
                            <span className="font-medium">
                                Error loading image
                            </span>
                        </span>
                    </span>
                ))}

            <Image
                className={cn(
                    "size-full rounded-2xl object-cover transition-opacity duration-100",
                    isLoaded ? "opacity-100" : "invisible opacity-0",
                    isError ? "opacity-0" : "opacity-100",
                    className,
                )}
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setIsError(true);
                    setIsLoaded(true);
                }}
                {...props}
            />
        </span>
    );
}

import {
    MOCK_LAZY_IMAGE_ALT_CUSTOM_ERROR,
    MOCK_LAZY_IMAGE_ALT_CUSTOM_LOADER,
    MOCK_LAZY_IMAGE_ALT_DEFAULT,
    MOCK_LAZY_IMAGE_ALT_ERROR,
    MOCK_LAZY_IMAGE_ALT_LOADING,
    MOCK_LAZY_IMAGE_URL_CUSTOM_ERROR,
    MOCK_LAZY_IMAGE_URL_CUSTOM_LOADER,
    MOCK_LAZY_IMAGE_URL_DEFAULT,
    MOCK_LAZY_IMAGE_URL_ERROR,
    MOCK_LAZY_IMAGE_URL_LOADING,
} from "#.storybook/lib/mocks/lazy-image";
import preview from "#.storybook/preview";
import { IconPhoto } from "@tabler/icons-react";

import { LazyImage } from "./lazy-image";

const meta = preview.meta({
    component: LazyImage,
    argTypes: {
        src: {
            control: "text",
            description: "The image source URL",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        alt: {
            control: "text",
            description: "Alternative text for the image",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        renderLoader: {
            description: "Custom loader component (ReactNode)",
            table: {
                type: {
                    summary: "ReactNode",
                },
            },
        },
        renderError: {
            description: "Custom error component (ReactNode)",
            table: {
                type: {
                    summary: "ReactNode",
                },
            },
        },
        classNameLoader: {
            control: "text",
            description: "Additional CSS classes for the loader",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameError: {
            control: "text",
            description: "Additional CSS classes for the error state",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameWrapper: {
            control: "text",
            description: "Additional CSS classes for the wrapper",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        isLoaded: {
            control: "boolean",
            description: "Controlled loaded state",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        isError: {
            control: "boolean",
            description: "Controlled error state",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        width: {
            control: "number",
            description: "Image width",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        height: {
            control: "number",
            description: "Image height",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        src: MOCK_LAZY_IMAGE_URL_DEFAULT,
        alt: MOCK_LAZY_IMAGE_ALT_DEFAULT,
        width: 800,
        height: 600,
        classNameWrapper: "relative block size-full max-w-2xl",
    },
});

export const LoadingState = meta.story({
    args: {
        src: MOCK_LAZY_IMAGE_URL_LOADING,
        alt: MOCK_LAZY_IMAGE_ALT_LOADING,
        width: 800,
        height: 600,
        isLoaded: false,
        classNameWrapper: "relative block size-full max-w-2xl",
    },
});

export const ErrorState = meta.story({
    args: {
        src: MOCK_LAZY_IMAGE_URL_ERROR,
        alt: MOCK_LAZY_IMAGE_ALT_ERROR,
        width: 800,
        height: 600,
        isError: true,
        classNameWrapper: "relative block size-full max-w-2xl",
    },
});

export const CustomLoader = meta.story({
    args: {
        src: MOCK_LAZY_IMAGE_URL_CUSTOM_LOADER,
        alt: MOCK_LAZY_IMAGE_ALT_CUSTOM_LOADER,
        width: 800,
        height: 600,
        isLoaded: false,
        renderLoader: (
            <span className="absolute grid size-full place-items-center rounded-2xl bg-zinc-900">
                <div className="flex flex-col items-center gap-2 text-zinc-100">
                    <IconPhoto className="size-12 animate-pulse" />
                    <span className="animate-pulse text-sm font-medium">
                        Loading image...
                    </span>
                </div>
            </span>
        ),
        classNameWrapper: "relative block size-full max-w-2xl",
    },
});

export const CustomError = meta.story({
    args: {
        src: MOCK_LAZY_IMAGE_URL_CUSTOM_ERROR,
        alt: MOCK_LAZY_IMAGE_ALT_CUSTOM_ERROR,
        width: 800,
        height: 600,
        isError: true,
        renderError: (
            <span className="absolute grid size-full place-items-center rounded-2xl bg-zinc-900">
                <div className="flex flex-col items-center gap-2">
                    <IconPhoto className="size-12 text-rose-500" />
                    <span className="text-sm font-medium text-rose-500">
                        Failed to load image
                    </span>
                </div>
            </span>
        ),
        classNameWrapper: "relative block size-full max-w-2xl",
    },
});

import {
    MOCK_IMAGE_BANNER_ALT_CUSTOM_FUNCTION,
    MOCK_IMAGE_BANNER_ALT_CUSTOM_NAME,
    MOCK_IMAGE_BANNER_ALT_CUSTOM_NODE,
    MOCK_IMAGE_BANNER_ALT_DEFAULT,
    MOCK_IMAGE_BANNER_ALT_WITHOUT_BUTTON,
    MOCK_IMAGE_BANNER_DOWNLOAD_NAME,
    MOCK_IMAGE_BANNER_URL_CUSTOM_FUNCTION,
    MOCK_IMAGE_BANNER_URL_CUSTOM_NAME,
    MOCK_IMAGE_BANNER_URL_CUSTOM_NODE,
    MOCK_IMAGE_BANNER_URL_DEFAULT,
    MOCK_IMAGE_BANNER_URL_SIZES,
    MOCK_IMAGE_BANNER_URL_VARIANTS,
    MOCK_IMAGE_BANNER_URL_WITHOUT_BUTTON,
} from "#.storybook/lib/mocks/image-banner";
import { setupDownloadMock } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { IconDownload } from "@tabler/icons-react";
import { expect, userEvent, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { ImageBanner } from "./image-banner";

const meta = preview.meta({
    component: ImageBanner,
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
        downloadName: {
            control: "text",
            description: "Custom name for the downloaded file",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        showDownloadButton: {
            control: "boolean",
            description: "Whether to show the download button",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        buttonVariant: {
            control: "select",
            options: [
                "default",
                "destructive",
                "outline",
                "secondary",
                "tertiary",
                "ghost",
                "blurred",
                "ghost-blurred",
                "link",
            ],
            description: "Variant of the download button",
            table: {
                type: {
                    summary: "ButtonVariant",
                },
                defaultValue: {
                    summary: "blurred",
                },
            },
        },
        buttonSize: {
            control: "select",
            options: ["none", "default", "sm", "xs", "lg", "icon"],
            description: "Size of the download button",
            table: {
                type: {
                    summary: "ButtonSize",
                },
                defaultValue: {
                    summary: "icon",
                },
            },
        },
        renderDownloadButton: {
            description:
                "Custom download button renderer (ReactNode or function)",
            table: {
                type: {
                    summary:
                        "ReactNode | ((props: { src: string; alt?: string }) => ReactNode)",
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
        classNameButton: {
            control: "text",
            description: "Additional CSS classes for the download button",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        src: MOCK_IMAGE_BANNER_URL_DEFAULT,
        alt: MOCK_IMAGE_BANNER_ALT_DEFAULT,
        width: 800,
        height: 600,
    },
});

Default.test(
    "should trigger download when download button is clicked",
    async ({ canvas, step, args }) => {
        const downloadMock = setupDownloadMock({
            url: args.src,
            contentType: "image/jpeg",
        });

        try {
            await step("Find and click the download button", async () => {
                const downloadButton = await canvas.findByRole(
                    "button",
                    {
                        name: /download image/i,
                    },
                    { timeout: 3000 },
                );
                expect(downloadButton).toBeInTheDocument();
                await userEvent.click(downloadButton);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadMock.flags.fetchCalled).toBe(true);
                        expect(downloadMock.flags.downloadLinkCreated).toBe(
                            true,
                        );
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            downloadMock.cleanup();
        }
    },
);

export const WithoutDownloadButton = meta.story({
    args: {
        src: MOCK_IMAGE_BANNER_URL_WITHOUT_BUTTON,
        alt: MOCK_IMAGE_BANNER_ALT_WITHOUT_BUTTON,
        showDownloadButton: false,
        width: 800,
        height: 600,
    },
});

export const CustomDownloadName = meta.story({
    args: {
        src: MOCK_IMAGE_BANNER_URL_CUSTOM_NAME,
        alt: MOCK_IMAGE_BANNER_ALT_CUSTOM_NAME,
        downloadName: MOCK_IMAGE_BANNER_DOWNLOAD_NAME,
        width: 800,
        height: 600,
    },
});

export const DifferentButtonVariants = meta.story({
    render: () => (
        <div className="bg-zinc-925 grid grid-cols-2 gap-4 rounded-2xl p-4">
            <div>
                <p className="mb-2 text-sm text-zinc-100">Default variant</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_VARIANTS.default}
                    alt="Default button variant"
                    buttonVariant="default"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Outline variant</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_VARIANTS.outline}
                    alt="Outline button variant"
                    buttonVariant="outline"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Secondary variant</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_VARIANTS.secondary}
                    alt="Secondary button variant"
                    buttonVariant="secondary"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Ghost variant</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_VARIANTS.ghost}
                    alt="Ghost button variant"
                    buttonVariant="ghost"
                    width={400}
                    height={300}
                />
            </div>
        </div>
    ),
});

export const CustomDownloadButtonAsNode = meta.story({
    args: {
        src: MOCK_IMAGE_BANNER_URL_CUSTOM_NODE,
        alt: MOCK_IMAGE_BANNER_ALT_CUSTOM_NODE,
        renderDownloadButton: (
            <Button variant="outline" className="absolute right-4 top-4 z-10">
                <IconDownload />
                Download
            </Button>
        ),
        width: 800,
        height: 600,
    },
});

export const CustomDownloadButtonAsFunction = meta.story({
    args: {
        src: MOCK_IMAGE_BANNER_URL_CUSTOM_FUNCTION,
        alt: MOCK_IMAGE_BANNER_ALT_CUSTOM_FUNCTION,
        renderDownloadButton: ({ src, alt }) => (
            <Button
                variant="outline"
                className="absolute right-4 top-4 z-10"
                onClick={() => {
                    console.log("Downloading:", src, alt);
                }}
            >
                <IconDownload />
                Download
            </Button>
        ),
        width: 800,
        height: 600,
    },
});

export const DifferentImageSizes = meta.story({
    render: () => (
        <div className="bg-zinc-925 space-y-4 rounded-3xl p-4">
            <div>
                <p className="mb-2 text-sm text-zinc-100">Square (1:1)</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_SIZES.square}
                    alt="Square image"
                    width={500}
                    height={500}
                    classNameWrapper="w-full max-w-md"
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Landscape (16:9)</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_SIZES.landscape}
                    alt="Landscape image"
                    width={800}
                    height={450}
                    classNameWrapper="w-full max-w-2xl"
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Portrait (9:16)</p>
                <ImageBanner
                    src={MOCK_IMAGE_BANNER_URL_SIZES.portrait}
                    alt="Portrait image"
                    width={450}
                    height={800}
                    classNameWrapper="w-full max-w-sm"
                />
            </div>
        </div>
    ),
});

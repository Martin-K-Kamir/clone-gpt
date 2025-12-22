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
        src: "https://picsum.photos/id/237/800/600",
        alt: "Dog image",
        width: 800,
        height: 600,
    },
});

Default.test(
    "should trigger download when download button is clicked",
    async ({ canvas, step }) => {
        const imageUrl = "https://picsum.photos/id/237/800/600";
        let fetchCalled = false;
        let downloadLinkCreated = false;

        // Mock fetch to track if download was triggered
        const originalFetch = window.fetch;
        window.fetch = async (input: RequestInfo | URL) => {
            if (typeof input === "string" && input === imageUrl) {
                fetchCalled = true;
                return new Response(
                    new Blob(["test"], { type: "image/jpeg" }),
                    {
                        status: 200,
                        headers: { "Content-Type": "image/jpeg" },
                    },
                );
            }
            return originalFetch(input);
        };

        // Track if download link is created
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (
            tagName: string,
            options?: ElementCreationOptions,
        ) {
            const element = originalCreateElement(tagName, options);
            if (tagName === "a") {
                downloadLinkCreated = true;
                // Prevent actual download
                element.click = function () {
                    // Mock click - don't actually download
                };
            }
            return element;
        };

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
                        expect(fetchCalled).toBe(true);
                        expect(downloadLinkCreated).toBe(true);
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            // Cleanup
            window.fetch = originalFetch;
            document.createElement = originalCreateElement;
        }
    },
);

export const WithoutDownloadButton = meta.story({
    args: {
        src: "https://picsum.photos/id/1015/800/600",
        alt: "Image without download button",
        showDownloadButton: false,
        width: 800,
        height: 600,
    },
});

export const CustomDownloadName = meta.story({
    args: {
        src: "https://picsum.photos/id/1018/800/600",
        alt: "Image with custom download name",
        downloadName: "my-custom-image.jpg",
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
                    src="https://picsum.photos/id/1001/400/300"
                    alt="Default button variant"
                    buttonVariant="default"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Outline variant</p>
                <ImageBanner
                    src="https://picsum.photos/id/1002/400/300"
                    alt="Outline button variant"
                    buttonVariant="outline"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Secondary variant</p>
                <ImageBanner
                    src="https://picsum.photos/id/1003/400/300"
                    alt="Secondary button variant"
                    buttonVariant="secondary"
                    width={400}
                    height={300}
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Ghost variant</p>
                <ImageBanner
                    src="https://picsum.photos/id/1004/400/300"
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
        src: "https://picsum.photos/id/1011/800/600",
        alt: "Image with custom download button",
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
        src: "https://picsum.photos/id/1012/800/600",
        alt: "Image with custom download button function",
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
                    src="https://picsum.photos/id/1013/500/500"
                    alt="Square image"
                    width={500}
                    height={500}
                    classNameWrapper="w-full max-w-md"
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Landscape (16:9)</p>
                <ImageBanner
                    src="https://picsum.photos/id/1014/800/450"
                    alt="Landscape image"
                    width={800}
                    height={450}
                    classNameWrapper="w-full max-w-2xl"
                />
            </div>
            <div>
                <p className="mb-2 text-sm text-zinc-100">Portrait (9:16)</p>
                <ImageBanner
                    src="https://picsum.photos/id/1016/450/800"
                    alt="Portrait image"
                    width={450}
                    height={800}
                    classNameWrapper="w-full max-w-sm"
                />
            </div>
        </div>
    ),
});

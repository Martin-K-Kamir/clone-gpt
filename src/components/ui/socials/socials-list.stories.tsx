import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { SocialsList } from "./socials-list";

const meta = preview.meta({
    component: SocialsList,
    args: {
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        onClick: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        url: {
            control: "text",
            description: "The URL to share",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        text: {
            control: "text",
            description: "The text/message to share along with the URL",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        showNativeShare: {
            control: "boolean",
            description:
                "Whether to show the native share button (if supported by the browser)",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        onClick: {
            description: "Callback fired when a social share link is clicked",
            table: {
                type: {
                    summary: "(e: React.MouseEvent<HTMLAnchorElement>) => void",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the social buttons are disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
            defaultValue: {
                summary: "false",
            },
        },
    },
});

export const Default = meta.story();

Default.test("should render all social buttons", ({ canvas }) => {
    const links = canvas.getAllByRole("link");

    expect(links).toHaveLength(3);
});

Default.test("should have Twitter share link", ({ canvas }) => {
    const twitterLink = canvas.getByRole("link", { name: "Share on Twitter" });
    expect(twitterLink).toBeVisible();
    expect(twitterLink).toHaveAttribute(
        "href",
        expect.stringContaining("twitter.com"),
    );
});

Default.test("should have Reddit share link", ({ canvas }) => {
    const redditLink = canvas.getByRole("link", { name: "Share on Reddit" });
    expect(redditLink).toBeVisible();
    expect(redditLink).toHaveAttribute(
        "href",
        expect.stringContaining("reddit.com"),
    );
});

Default.test("should have LinkedIn share link", ({ canvas }) => {
    const linkedinLink = canvas.getByRole("link", {
        name: "Share on LinkedIn",
    });
    expect(linkedinLink).toBeVisible();
    expect(linkedinLink).toHaveAttribute(
        "href",
        expect.stringContaining("linkedin.com"),
    );
});

export const WithoutNativeShare = meta.story({
    args: {
        showNativeShare: false,
    },
});

WithoutNativeShare.test(
    "should not render native share button",
    ({ canvas }) => {
        const nativeShareButton = canvas.queryByRole("button", {
            name: "Share",
        });
        expect(nativeShareButton).not.toBeInTheDocument();
    },
);

export const ShareBlogPost = meta.story({
    name: "Share Blog Post",
    args: {
        url: "https://myblog.com/how-to-build-ai-chatbot",
        text: "I just wrote a comprehensive guide on building AI chatbots. Check it out!",
    },
});

export const ShareLongMessage = meta.story({
    name: "Share Long Message",
    args: {
        url: "https://example.com/comprehensive-guide-to-modern-web-development",
        text: "This is an incredibly comprehensive guide covering everything from HTML basics to advanced React patterns, TypeScript best practices, and modern CSS techniques. Highly recommend for both beginners and experienced developers!",
    },
});

export const WithClickHandler = meta.story({
    name: "With Click Handler",
    parameters: {
        chromatic: {
            disableSnapshot: true,
        },
    },
    args: {
        url: "https://example.com/tracked-share",
        text: "Check this out!",
        onClick: fn(),
    },
});

WithClickHandler.test(
    "should call onClick when social link is clicked",
    async ({ userEvent, canvas, args }) => {
        const link = canvas.getByRole("link", { name: "Share on Twitter" });
        await userEvent.click(link);
        expect(args.onClick).toHaveBeenCalled();
    },
);

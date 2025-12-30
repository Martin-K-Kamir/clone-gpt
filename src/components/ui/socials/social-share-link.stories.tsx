import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { FaLinkedin, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { SocialShareLink } from "./social-share-link";

const meta = preview.meta({
    component: SocialShareLink,
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        children: "Share on Twitter",
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        platform: {
            control: "select",
            options: ["linkedin", "twitter", "reddit"],
            description: "The social platform to share to",
            table: {
                type: {
                    summary: "'linkedin' | 'twitter' | 'reddit'",
                },
            },
        },
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
        openIn: {
            control: "select",
            options: ["new-tab", "popup"],
            description:
                "How to open the share link - in a new tab or popup window",
            table: {
                type: {
                    summary: "'new-tab' | 'popup'",
                },
                defaultValue: {
                    summary: "new-tab",
                },
            },
        },
        popupOptions: {
            control: "object",
            description:
                "Options for the popup window (only applies when openIn is 'popup')",
            table: {
                type: {
                    summary:
                        "{ width?: number; height?: number; scrollbars?: boolean; resizable?: boolean }",
                },
            },
        },
        children: {
            control: "text",
            description: "The content of the link/button",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
    },
});

export const Default = meta.story();

Default.test("should render as anchor tag by default", ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Share on Twitter" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

Default.test("should have correct Twitter share URL", ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Share on Twitter" });
    expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("twitter.com/intent/tweet"),
    );
});

export const LinkedIn = meta.story({
    name: "Platform: LinkedIn",
    args: {
        platform: "linkedin",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        children: "Share on LinkedIn",
    },
});

LinkedIn.test("should have correct LinkedIn share URL", ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Share on LinkedIn" });
    expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("linkedin.com"),
    );
});

export const Twitter = meta.story({
    name: "Platform: Twitter",
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        children: "Share on Twitter",
    },
});

export const Reddit = meta.story({
    name: "Platform: Reddit",
    args: {
        platform: "reddit",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        children: "Share on Reddit",
    },
});

Reddit.test("should have correct Reddit share URL", ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Share on Reddit" });
    expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("reddit.com/submit"),
    );
});

export const OpenInPopup = meta.story({
    name: "Open In: Popup",
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        openIn: "popup",
        children: "Share in Popup",
    },
});

OpenInPopup.test(
    "should call window.open in popup mode when clicked",
    async ({ canvas, userEvent }) => {
        const mockOpen = fn().mockReturnValue({ focus: fn() });
        const originalOpen = window.open;
        window.open = mockOpen;

        try {
            const button = canvas.getByRole("button", {
                name: "Share in Popup",
            });
            await userEvent.click(button);

            await waitFor(() => {
                expect(mockOpen).toHaveBeenCalledTimes(1);
            });

            expect(mockOpen).toHaveBeenCalledWith(
                expect.stringContaining("twitter.com/intent/tweet"),
                "share-twitter",
                expect.any(String),
            );
        } finally {
            window.open = originalOpen;
        }
    },
);

export const OpenInNewTab = meta.story({
    name: "Open In: New Tab",
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        openIn: "new-tab",
        children: "Share in New Tab",
    },
});

OpenInNewTab.test(
    "should render as anchor with target=_blank for new tab mode",
    ({ canvas }) => {
        const link = canvas.getByRole("link", { name: "Share in New Tab" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        expect(link).toHaveAttribute(
            "href",
            expect.stringContaining("twitter.com/intent/tweet"),
        );
    },
);

OpenInNewTab.test(
    "should not call window.open for new tab mode (uses native anchor behavior)",
    async ({ canvas, userEvent }) => {
        const mockOpen = fn();
        const originalOpen = window.open;
        window.open = mockOpen;

        try {
            const link = canvas.getByRole("link", { name: "Share in New Tab" });
            await clickLinkAndVerify(link, userEvent);

            expect(mockOpen).not.toHaveBeenCalled();
        } finally {
            window.open = originalOpen;
        }
    },
);

export const WithCustomPopupOptions = meta.story({
    name: "With Custom Popup Options",
    args: {
        platform: "linkedin",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
        openIn: "popup",
        popupOptions: {
            width: 800,
            height: 600,
            scrollbars: false,
            resizable: false,
        },
        children: "Share with Custom Popup",
    },
});

export const WithIcon = meta.story({
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
    },
    render: args => (
        <SocialShareLink {...args}>
            <FaXTwitter className="mr-2 inline-block" />
            Share on X
        </SocialShareLink>
    ),
});

export const IconOnly = meta.story({
    args: {
        platform: "twitter",
        url: "https://example.com/my-article",
        text: "Check out this amazing article!",
    },
    render: args => (
        <SocialShareLink {...args} aria-label="Share on Twitter">
            <FaXTwitter size={20} />
        </SocialShareLink>
    ),
});

export const WithButtonComponent = meta.story({
    args: {
        platform: "twitter",
        url: "https://example.com",
        text: "Check this out!",
    },
    render: () => (
        <div className="flex gap-4">
            <Button variant="secondary" size="icon" asChild>
                <SocialShareLink
                    platform="linkedin"
                    url="https://example.com"
                    text="Check this out!"
                    aria-label="Share on LinkedIn"
                >
                    <FaLinkedin />
                </SocialShareLink>
            </Button>
            <Button variant="secondary" size="icon" asChild>
                <SocialShareLink
                    platform="twitter"
                    url="https://example.com"
                    text="Check this out!"
                    aria-label="Share on Twitter"
                >
                    <FaXTwitter />
                </SocialShareLink>
            </Button>
            <Button variant="secondary" size="icon" asChild>
                <SocialShareLink
                    platform="reddit"
                    url="https://example.com"
                    text="Check this out!"
                    aria-label="Share on Reddit"
                >
                    <FaRedditAlien />
                </SocialShareLink>
            </Button>
        </div>
    ),
});

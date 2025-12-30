import {
    MOCK_SOCIALS_TEXT_BLOG_POST,
    MOCK_SOCIALS_TEXT_DEFAULT,
    MOCK_SOCIALS_TEXT_LONG,
    MOCK_SOCIALS_TEXT_TRACKED,
    MOCK_SOCIALS_URL_BLOG_POST,
    MOCK_SOCIALS_URL_DEFAULT,
    MOCK_SOCIALS_URL_LONG,
    MOCK_SOCIALS_URL_TRACKED,
} from "#.storybook/lib/mocks/socials";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { SocialsList } from "./socials-list";

const meta = preview.meta({
    component: SocialsList,
    args: {
        url: MOCK_SOCIALS_URL_DEFAULT,
        text: MOCK_SOCIALS_TEXT_DEFAULT,
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
    args: {
        url: MOCK_SOCIALS_URL_BLOG_POST,
        text: MOCK_SOCIALS_TEXT_BLOG_POST,
    },
});

export const ShareLongMessage = meta.story({
    args: {
        url: MOCK_SOCIALS_URL_LONG,
        text: MOCK_SOCIALS_TEXT_LONG,
    },
});

export const WithClickHandler = meta.story({
    parameters: {
        chromatic: {
            disableSnapshot: true,
        },
    },
    args: {
        url: MOCK_SOCIALS_URL_TRACKED,
        text: MOCK_SOCIALS_TEXT_TRACKED,
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

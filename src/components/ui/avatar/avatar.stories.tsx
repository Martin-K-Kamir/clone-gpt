import preview from "#.storybook/preview";

import { Avatar, AvatarFallback, AvatarImage } from "./index";

type AvatarStoryArgs = {
    src?: string;
    alt?: string;
    fallback?: string;
    className?: string;
};

const meta = preview.meta({
    component: Avatar,
    tags: ["autodocs"],
    args: {
        src: "https://github.com/martin-k-kamir.png",
        alt: "User avatar",
        fallback: "CN",
    } as AvatarStoryArgs,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        src: {
            control: "text",
            description: "The source URL of the avatar image",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        alt: {
            control: "text",
            description: "The alt text for the avatar image",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        fallback: {
            control: "text",
            description:
                "The fallback text to display when the image fails to load",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the avatar root",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    } as Record<string, unknown>,
    render: args => {
        const { src, alt, fallback, className, ...avatarProps } =
            args as AvatarStoryArgs & React.ComponentProps<typeof Avatar>;
        return (
            <Avatar className={className} {...avatarProps}>
                {src && <AvatarImage src={src} alt={alt} />}
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
        );
    },
});

export const Default = meta.story();

export const WithImage = meta.story({
    args: {
        src: "https://github.com/martin-k-kamir.png",
        alt: "Martin Kamir",
        fallback: "MK",
    } as AvatarStoryArgs,
});

export const WithoutImage = meta.story({
    args: {
        src: "",
        alt: "",
        fallback: "CN",
    } as AvatarStoryArgs,
});

export const CustomFallback = meta.story({
    args: {
        src: "https://github.com/nonexistent-user.png",
        alt: "User",
        fallback: "JD",
    } as AvatarStoryArgs,
});

export const Large = meta.story({
    args: {
        src: "https://github.com/martin-k-kamir.png",
        alt: "User avatar",
        fallback: "CN",
        className: "size-16",
    } as AvatarStoryArgs,
});

export const Small = meta.story({
    args: {
        src: "https://github.com/martin-k-kamir.png",
        alt: "User avatar",
        fallback: "CN",
        className: "size-6",
    } as AvatarStoryArgs,
});

import { IconShare2 } from "@tabler/icons-react";
import { FaLinkedin, FaRedditAlien, FaXTwitter } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { useNativeShare } from "@/hooks";

import { SocialShareLink } from "./social-share-link";

type SocialsListProps = {
    url: string;
    text: string;
    showNativeShare?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
} & React.ComponentProps<"ul">;

export function SocialsList({
    showNativeShare = true,
    url,
    text,
    disabled,
    onClick,
    ...props
}: SocialsListProps) {
    const { canShare, share } = useNativeShare({
        onShare: () => ({
            text,
            url,
        }),
    });
    return (
        <ul className="flex items-center justify-center gap-3" {...props}>
            <li>
                <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-[#0077b5]"
                    asChild
                    disabled={disabled}
                >
                    <SocialShareLink
                        platform="linkedin"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaLinkedin />
                        <span className="sr-only">Share on LinkedIn</span>
                    </SocialShareLink>
                </Button>
            </li>
            <li>
                <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-[#000000]"
                    asChild
                    disabled={disabled}
                >
                    <SocialShareLink
                        platform="twitter"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaXTwitter />
                        <span className="sr-only">Share on Twitter</span>
                    </SocialShareLink>
                </Button>
            </li>
            <li>
                <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-[#ff4500]"
                    asChild
                    disabled={disabled}
                >
                    <SocialShareLink
                        platform="reddit"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaRedditAlien />
                        <span className="sr-only">Share on Reddit</span>
                    </SocialShareLink>
                </Button>
            </li>
            {showNativeShare && canShare && (
                <li>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={share}
                        disabled={disabled}
                        className="disabled:opacity-100"
                    >
                        <IconShare2 />
                        <span className="sr-only">Share</span>
                    </Button>
                </li>
            )}
        </ul>
    );
}

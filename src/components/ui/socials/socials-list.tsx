import { IconShare2 } from "@tabler/icons-react";
import { FaLinkedin, FaRedditAlien, FaXTwitter } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { useNativeShare } from "@/hooks";

import { SocialShareLink } from "./social-share-link";

type SocialsListProps = {
    url: string;
    text: string;
    showNativeShare?: boolean;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
} & React.ComponentProps<"ul">;

export function SocialsList({
    showNativeShare = true,
    url,
    text,
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
                >
                    <SocialShareLink
                        platform="linkedin"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaLinkedin />
                    </SocialShareLink>
                </Button>
            </li>
            <li>
                <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-[#000000]"
                    asChild
                >
                    <SocialShareLink
                        platform="twitter"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaXTwitter />
                    </SocialShareLink>
                </Button>
            </li>
            <li>
                <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-[#ff4500]"
                    asChild
                >
                    <SocialShareLink
                        platform="reddit"
                        url={url}
                        text={text}
                        onClick={onClick}
                    >
                        <FaRedditAlien />
                    </SocialShareLink>
                </Button>
            </li>
            {showNativeShare && canShare && (
                <li>
                    <Button variant="secondary" size="icon" onClick={share}>
                        <IconShare2 />
                    </Button>
                </li>
            )}
        </ul>
    );
}

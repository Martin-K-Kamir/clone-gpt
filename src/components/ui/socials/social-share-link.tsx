import {
    type PopupOptions,
    type SocialPlatform,
    useSocialShare,
} from "@/hooks";

type OpenIn = "popup" | "new-tab";

type SocialShareLinkProps<T extends OpenIn = "new-tab"> = {
    platform: SocialPlatform;
    url: string;
    text: string;
    openIn?: T;
    popupOptions?: PopupOptions;
} & (T extends "popup"
    ? Omit<React.ComponentProps<"button">, "onClick">
    : Omit<React.ComponentProps<"a">, "href">);

export function SocialShareLink<T extends OpenIn = "new-tab">({
    openIn,
    popupOptions,
    platform,
    url,
    text,
    ...props
}: SocialShareLinkProps<T>) {
    const { getShareUrl, openSharePopup } = useSocialShare();

    const finalOpenIn = openIn ?? "new-tab";

    if (finalOpenIn === "popup") {
        return (
            <button
                onClick={() => {
                    openSharePopup(platform, { url, text }, popupOptions);
                }}
                {...(props as React.ComponentProps<"button">)}
            />
        );
    }

    return (
        <a
            href={getShareUrl(platform, { url, text })}
            target="_blank"
            rel="noopener noreferrer"
            {...(props as React.ComponentProps<"a">)}
        />
    );
}

import { memo } from "react";

import { HardMemoizedImageBanner as ImageBanner } from "@/components/ui/image-banner";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIFileMessagePart } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatMessageUploadsImagesProps = {
    parts: UIFileMessagePart[];
    classNameItem?: string | ((isMultiple: boolean) => string);
} & Omit<React.ComponentProps<"ul">, "children">;

export function ChatMessageUploadsImages({
    parts,
    classNameItem,
    ...props
}: ChatMessageUploadsImagesProps) {
    const imageParts = parts.filter(
        part => part.kind === CHAT_MESSAGE_TYPE.IMAGE,
    );

    if (imageParts.length === 0) {
        return null;
    }

    return (
        <ul {...props}>
            {imageParts.map(part => (
                <li
                    key={part.name}
                    className={cn(
                        classNameItem,
                        typeof classNameItem === "function"
                            ? classNameItem(imageParts.length > 1)
                            : classNameItem,
                    )}
                >
                    <ImageBanner
                        priority
                        src={part.url}
                        alt={part.name}
                        downloadName={part.name}
                        width={part.width ?? 500}
                        height={part.height ?? 500}
                        className="size-full object-cover"
                        classNameWrapper="size-full"
                    />
                </li>
            ))}
        </ul>
    );
}

export const MemoizedChatMessageUploadsImages = memo(ChatMessageUploadsImages);
export const HardMemoizedChatMessageUploadsImages = memo(
    ChatMessageUploadsImages,
    () => true,
);

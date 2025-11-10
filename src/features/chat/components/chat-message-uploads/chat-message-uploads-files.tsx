import { memo } from "react";

import { HardMemoizedFileBanner as FileBanner } from "@/components/ui/file-banner";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIFileMessagePart } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatMessageUploadsFilesProps = {
    parts: UIFileMessagePart[];
    classNameItem?: string | ((isMultiple: boolean) => string);
} & Omit<React.ComponentProps<"ul">, "children">;

export function ChatMessageUploadsFiles({
    parts,
    classNameItem,
    ...props
}: ChatMessageUploadsFilesProps) {
    const fileParts = parts.filter(
        part => part.kind === CHAT_MESSAGE_TYPE.FILE,
    );

    if (fileParts.length === 0) {
        return null;
    }

    return (
        <ul {...props}>
            {fileParts.map(part => (
                <li
                    key={part.name}
                    className={cn(
                        classNameItem,
                        typeof classNameItem === "function"
                            ? classNameItem(fileParts.length > 1)
                            : classNameItem,
                    )}
                >
                    <FileBanner
                        download
                        url={part.url}
                        name={part.name}
                        size={part?.size}
                        type={part.extension}
                    />
                </li>
            ))}
        </ul>
    );
}

export const MemoizedChatMessageUploadsFiles = memo(ChatMessageUploadsFiles);
export const HardMemoizedChatMessageUploadsFiles = memo(
    ChatMessageUploadsFiles,
    () => true,
);

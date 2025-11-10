import { cn } from "@/lib/utils";

import { ChatMessageCopyButton } from "./chat-message-copy-button";
import { ChatMessageUpdateButton } from "./chat-message-update-button";

type ChatMessageActionsUserProps = {
    content: string;
    disabled?: boolean;
    showUpdate?: boolean;
    showCopy?: boolean;
    onUpdate?: () => void;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageActionsUser({
    content,
    className,
    disabled,
    showUpdate = true,
    showCopy = true,
    onUpdate,
    ...props
}: ChatMessageActionsUserProps) {
    return (
        <div
            className={cn("flex items-center justify-end", className)}
            {...props}
        >
            {showCopy && (
                <ChatMessageCopyButton content={content} disabled={disabled} />
            )}
            {showUpdate && (
                <ChatMessageUpdateButton
                    onClick={onUpdate}
                    disabled={disabled}
                />
            )}
        </div>
    );
}

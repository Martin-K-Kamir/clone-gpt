import { IconCheck, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { useCopyToClipboard } from "@/hooks";

import { ChatMessageButton } from "./chat-message-button";

type ChatMessageCopyButtonProps = {
    content: string;
} & Omit<React.ComponentProps<typeof ChatMessageButton>, "children">;

export function ChatMessageCopyButton({
    ref,
    content,
    onClick,
    disabled,
    ...props
}: ChatMessageCopyButtonProps) {
    const { copied, copy } = useCopyToClipboard({
        onError: message => {
            toast.error(message);
        },
    });

    return (
        <ChatMessageButton
            ref={ref}
            onClick={e => {
                if (disabled) return;
                copy(content);
                onClick?.(e);
            }}
            tooltip="Copy"
            tooltipProps={{
                open: copied ? false : undefined,
            }}
            disabled={disabled}
            {...props}
        >
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
            {copied ? <IconCheck /> : <IconCopy />}
        </ChatMessageButton>
    );
}

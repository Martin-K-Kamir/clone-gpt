import { IconPencil } from "@tabler/icons-react";

import { ChatMessageButton } from "./chat-message-button";

export function ChatMessageUpdateButton({
    ...props
}: Omit<React.ComponentProps<typeof ChatMessageButton>, "children">) {
    return (
        <ChatMessageButton tooltip="Update message" {...props}>
            <span className="sr-only">Update</span>
            <IconPencil />
        </ChatMessageButton>
    );
}

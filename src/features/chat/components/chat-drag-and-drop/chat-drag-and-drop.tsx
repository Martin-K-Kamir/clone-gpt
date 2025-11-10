import { useChatFilesContext } from "@/features/chat/providers";

import { useDragAndDrop } from "@/hooks";

import { ChatDragAndDropMessage } from "./chat-drag-and-drop-message";

type ChatDragAndDropProps = {
    renderDragOverMessage?: React.ReactNode;
} & React.ComponentProps<"div">;

export function ChatDragAndDrop({
    renderDragOverMessage,
    children,
    ...props
}: ChatDragAndDropProps) {
    const { handleFileSelect } = useChatFilesContext();
    const {
        isDragOver,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    } = useDragAndDrop({
        onDrop: e => {
            const files = Array.from(e.dataTransfer.files);
            handleFileSelect(files);
        },
    });

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            {...props}
        >
            {children}
            {isDragOver &&
                (renderDragOverMessage ?? <ChatDragAndDropMessage />)}
        </div>
    );
}

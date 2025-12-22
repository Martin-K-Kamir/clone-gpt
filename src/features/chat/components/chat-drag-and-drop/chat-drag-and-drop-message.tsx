import { IconUpload } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type ChatDragAndDropMessageProps = {
    title?: string;
    icon?: React.ReactNode;
} & React.ComponentProps<"div">;

export function ChatDragAndDropMessage({
    className,
    children,
    title = "Drag and drop files you want to add to the chat",
    icon = <IconUpload className="size-6" />,
    ...props
}: ChatDragAndDropMessageProps) {
    return (
        <div
            data-testid="chat-drag-and-drop-message"
            data-slot="chat-drag-and-drop-message"
            className={cn(
                "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-b-lg bg-black/60",
                className,
            )}
            {...props}
        >
            <div className="bg-zinc-925 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 p-6">
                {icon}
                <p className="text-default font-medium">{title}</p>
                {children}
            </div>
        </div>
    );
}

import { type ChatStatus } from "ai";

import { Loader } from "@/components/ui/loader";
import { TextShimmer } from "@/components/ui/text-shimmer";

import type { UIChatMessage } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatMessagesLoaderProps = {
    status: ChatStatus;
    classNameLoader?: string;
    classNameTextShimmer?: string;
    messages: UIChatMessage[];
} & Omit<React.ComponentProps<"div">, "children">;

const mapOfToolKeys = {
    "tool-webSearch": "Searching on the web",
    "tool-getWeather": "Getting the weather",
    "tool-generateImage": "Generating image",
    "tool-generateFile": "Generating file",
};

export function ChatMessagesLoader({
    messages,
    className,
    classNameLoader,
    classNameTextShimmer,
    status,
    ...props
}: ChatMessagesLoaderProps) {
    const lastAssistantMessage = messages
        ?.filter(message => message.role === "assistant")
        .at(-1);

    const hasText = lastAssistantMessage?.parts.some(
        part => part.type === "text",
    );

    const tool = lastAssistantMessage?.parts.find(part =>
        part.type.startsWith("tool"),
    );

    const toolDescription =
        mapOfToolKeys[tool?.type as keyof typeof mapOfToolKeys];

    if (status === "ready" || status === "error" || hasText) return null;

    return (
        <div
            ref={el => {
                el?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }}
            className={cn("min-h-96 pb-24", className)}
            {...props}
        >
            <div className="flex min-h-6 items-center gap-2.5">
                <Loader className={classNameLoader} />
                {toolDescription && (
                    <TextShimmer className={classNameTextShimmer}>
                        {toolDescription}...
                    </TextShimmer>
                )}
            </div>
        </div>
    );
}

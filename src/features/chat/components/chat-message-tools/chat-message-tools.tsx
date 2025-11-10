"use client";

import { memo } from "react";

import { HardMemoizedFileBanner as FileBanner } from "@/components/ui/file-banner";
import { HardMemoizedImageBanner as ImageCard } from "@/components/ui/image-banner";
import { HardMemoizedWeather as Weather } from "@/components/ui/weather";

import type { UIAssistantChatMessage } from "@/features/chat/lib/types";
import { isChatTool } from "@/features/chat/lib/utils";

import { getSizeDimensions } from "@/lib/utils";

type ChatMessageToolsProps = {
    parts: UIAssistantChatMessage["parts"];
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessageTools({ parts, ...props }: ChatMessageToolsProps) {
    return (
        <div {...props}>
            {parts.map(part => {
                if (!isChatTool(part) || !part.output) {
                    return null;
                }

                if (part.type === "tool-getWeather") {
                    return (
                        <Weather
                            key={part.toolCallId}
                            location={part.output.location}
                            forecasts={part.output.forecasts}
                            period={part.output.period}
                            timeFormat={part.output.timeFormat}
                            temperatureSystem={part.output.temperatureSystem}
                        />
                    );
                }

                if (part.type === "tool-generateImage") {
                    const { width, height } = getSizeDimensions(
                        part.output.size,
                    );

                    return (
                        <ImageCard
                            priority
                            key={part.toolCallId}
                            src={part.output.imageUrl}
                            alt={part.output.name}
                            width={width}
                            height={height}
                            downloadName={part.output.name}
                            classNameWrapper="w-2/3"
                        />
                    );
                }

                if (part.type === "tool-generateFile") {
                    return (
                        <FileBanner
                            download
                            key={part.toolCallId}
                            url={part.output.fileUrl}
                            name={part.output.name}
                            size={part.output.size ?? 0}
                            type={part.output.extension}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}

export const MemoizedChatMessageTools = memo(ChatMessageTools);
export const HardMemoizedChatMessageTools = memo(ChatMessageTools, () => true);

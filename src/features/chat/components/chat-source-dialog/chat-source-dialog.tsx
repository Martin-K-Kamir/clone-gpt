import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SourceIcons, SourceList } from "@/components/ui/source-previews";

import type { UIAssistantChatMessage } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatSourceDialogProps = {
    parts: UIAssistantChatMessage["parts"];
    disabled?: boolean;
    classNameTrigger?: string;
    triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

export function ChatSourceDialog({
    parts,
    disabled,
    classNameTrigger,
    triggerRef,
}: ChatSourceDialogProps) {
    const sources = parts
        .filter(part => part.type === "source-url")
        .filter(
            (part, index, array) =>
                array.findIndex(p => p.url === part.url) === index,
        );

    return (
        <Dialog>
            <DialogTrigger ref={triggerRef} asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "px-2 text-[13px] disabled:opacity-100",
                        sources.length === 0 && "!hidden",
                        classNameTrigger,
                    )}
                    disabled={disabled}
                >
                    <SourceIcons sources={sources}>
                        <span className="ml-1.5">Sources</span>
                    </SourceIcons>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="flex max-h-[calc(100vh-7rem)] flex-col pr-0 sm:max-w-2xl"
                classNameOverlay="max-h-svh overflow-y-hidden"
            >
                <DialogHeader>
                    <DialogTitle>Sources</DialogTitle>
                    <DialogDescription className="sr-only">
                        Sources used to generate the response.
                    </DialogDescription>
                </DialogHeader>
                <SourceList
                    sources={sources}
                    className="flex-1 overflow-y-auto pr-6"
                />
            </DialogContent>
        </Dialog>
    );
}

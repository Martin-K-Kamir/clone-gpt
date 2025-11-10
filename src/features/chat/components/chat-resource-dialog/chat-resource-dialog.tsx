import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ResourceIcons } from "@/components/ui/resource-icons";
import { ResourcePreviews } from "@/components/ui/resource-previews";

import type { UIAssistantChatMessage } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatResourceDialogProps = {
    parts: UIAssistantChatMessage["parts"];
    disabled?: boolean;
    classNameTrigger?: string;
    triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

export function ChatResourceDialog({
    parts,
    disabled,
    classNameTrigger,
    triggerRef,
}: ChatResourceDialogProps) {
    const resources = parts
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
                        resources.length === 0 && "!hidden",
                        classNameTrigger,
                    )}
                    disabled={disabled}
                >
                    <ResourceIcons resources={resources}>
                        <span className="ml-1.5">Resources</span>
                    </ResourceIcons>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="flex max-h-[calc(100vh-7rem)] flex-col pr-0 sm:max-w-2xl"
                classNameOverlay="max-h-svh overflow-y-hidden"
            >
                <DialogHeader>
                    <DialogTitle>Resources</DialogTitle>
                    <DialogDescription className="sr-only">
                        Resources used to generate the response.
                    </DialogDescription>
                </DialogHeader>
                <ResourcePreviews
                    resources={resources}
                    className="flex-1 overflow-y-auto pr-6"
                />
            </DialogContent>
        </Dialog>
    );
}

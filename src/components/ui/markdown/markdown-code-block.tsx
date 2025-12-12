"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { extractTextFromReactNode } from "@/lib/utils/extract-text-from-react-node";
import { getLanguageExtension } from "@/lib/utils/get-language-extension";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function MarkdownCodeBlock({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const { copied, copy } = useCopyToClipboard({
        onError: message => {
            toast.error(message);
        },
    });

    const extension = getLanguageExtension(className);

    if (!extension) {
        return <code className={className}>{children}</code>;
    }

    return (
        <div className="relative">
            <div className="pt-4.5 flex w-full items-center justify-between px-4 sm:px-6">
                <span className="font-mono text-xs text-zinc-200">
                    {extension}
                </span>
                <Button
                    key={copied ? "copied" : "copy"}
                    variant="ghost"
                    size="xs"
                    className="!h-auto !bg-transparent !p-0 font-mono !text-zinc-200 disabled:opacity-70"
                    onClick={() => {
                        copy(extractTextFromReactNode(children));
                    }}
                    disabled={copied}
                >
                    {copied ? (
                        <IconCheck className="size-3" />
                    ) : (
                        <IconCopy className="size-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>

            <div className={cn("overflow-y-auto p-4 sm:p-6", className)}>
                {children}
            </div>
        </div>
    );
}

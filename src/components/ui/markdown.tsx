"use client";

import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { marked } from "marked";
import React, { memo, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
    cn,
    extractTextFromReactNode,
    getLanguageExtension,
    isSupabaseStorageUrl,
    parseStorageFileUrl,
} from "@/lib/utils";

import {
    useCopyTableToClipboard,
    useCopyToClipboard,
    useDownloadTableAsCSV,
    useDownloadTableAsXLSX,
} from "@/hooks";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu";

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
}

function MarkdownCodeBlock({
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

function MarkdownTable({ children }: { children: React.ReactNode }) {
    const tableRef = useRef<HTMLTableElement>(null);
    const { copied, copyTable } = useCopyTableToClipboard(tableRef, {
        onError: message => {
            toast.error(message);
        },
    });
    const { downloadTableAsCSV } = useDownloadTableAsCSV(tableRef, {
        filename: "table-data",
    });
    const { downloadTableAsXLSX } = useDownloadTableAsXLSX(tableRef, {
        filename: "table-data",
    });

    return (
        <div className="group/table relative space-y-2">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={copyTable}
                    tooltip="Copy Table"
                    tooltipContentProps={{
                        side: "bottom",
                        sideOffset: 5,
                        className: "bg-zinc-800",
                    }}
                >
                    {copied ? (
                        <IconCheck className="size-4" />
                    ) : (
                        <IconCopy className="size-4" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            tooltip="Download Table"
                            tooltipContentProps={{
                                side: "bottom",
                                sideOffset: 5,
                                className: "bg-zinc-800",
                            }}
                        >
                            <IconDownload className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        onCloseAutoFocus={e => {
                            e.preventDefault();
                        }}
                    >
                        <DropdownMenuItem onClick={downloadTableAsCSV}>
                            Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={downloadTableAsXLSX}>
                            Download as Excel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-x-auto">
                <table
                    className="mb-6 mt-0 min-w-full border-collapse border border-zinc-700"
                    ref={tableRef}
                >
                    {children}
                </table>
            </div>
        </div>
    );
}

type MarkdownProps = {
    content: string;
    disableImageRendering?: boolean;
};

export const Markdown = ({ content, disableImageRendering }: MarkdownProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
                code: ({ className, children }) => (
                    <MarkdownCodeBlock className={className}>
                        {children}
                    </MarkdownCodeBlock>
                ),
                img: ({ src, alt }) => {
                    if (disableImageRendering) {
                        return null;
                    }

                    return <img src={src} alt={alt} />;
                },
                table: ({ children }) => (
                    <MarkdownTable>{children}</MarkdownTable>
                ),
                thead: ({ children }) => (
                    <thead className="bg-zinc-800">{children}</thead>
                ),
                tbody: ({ children }) => (
                    <tbody className="divide-y divide-zinc-700">
                        {children}
                    </tbody>
                ),
                tr: ({ children }) => (
                    <tr className="hover:bg-zinc-800/50">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="border border-zinc-700 !p-3 text-left font-semibold text-zinc-100">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="border border-zinc-700 !p-3 text-zinc-200 [&>*]:text-zinc-50">
                        {children}
                    </td>
                ),
                a: ({ href, children }) => {
                    const canDownload = isSupabaseStorageUrl(href);

                    if (canDownload) {
                        const result = parseStorageFileUrl(href);

                        if (!result) {
                            return null;
                        }

                        const { filename, extension } = result;

                        return (
                            <a
                                className="text-zinc-50"
                                href={`${href}?download=${filename}.${extension}`}
                                download={`${filename}.${extension}`}
                            >
                                {children}
                            </a>
                        );
                    }

                    return (
                        <a
                            className="text-zinc-50"
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

const MemoizedMarkdownBlock = memo(
    ({
        content,
        disableImageRendering,
    }: {
        content: string;
        disableImageRendering?: boolean;
    }) => {
        return (
            <Markdown
                content={content}
                disableImageRendering={disableImageRendering}
            />
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.content !== nextProps.content) return false;
        if (prevProps.disableImageRendering !== nextProps.disableImageRendering)
            return false;
        return true;
    },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
    ({
        content,
        id,
        disableImageRendering,
    }: {
        content: string;
        id: string;
        disableImageRendering?: boolean;
    }) => {
        const blocks = useMemo(
            () => parseMarkdownIntoBlocks(content),
            [content],
        );

        return blocks.map((block, index) => (
            <MemoizedMarkdownBlock
                content={block}
                key={`${id}-block_${index}`}
                disableImageRendering={disableImageRendering}
            />
        ));
    },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

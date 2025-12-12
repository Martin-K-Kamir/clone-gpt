"use client";

import { marked } from "marked";
import React, { ComponentProps, memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { MarkdownCodeBlock } from "./markdown-code-block";
import { MarkdownLink } from "./markdown-link";
import { MarkdownTable } from "./markdown-table";

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
}

type MarkdownProps = {
    content: string;
    disableImageRendering?: boolean;
};

type MarkdownComponents = ComponentProps<typeof ReactMarkdown>["components"];

export const Markdown = ({ content, disableImageRendering }: MarkdownProps) => {
    const components = useMemo(() => {
        return {
            code: ({ className, children }) => (
                <MarkdownCodeBlock className={className}>
                    {children}
                </MarkdownCodeBlock>
            ),
            img: props => {
                if (disableImageRendering) {
                    return null;
                }

                return <img {...props} alt={props.alt ?? "Image"} />;
            },
            table: props => <MarkdownTable {...props} />,
            thead: ({ children }) => (
                <thead className="bg-zinc-800">{children}</thead>
            ),
            tbody: ({ children }) => (
                <tbody className="divide-y divide-zinc-700">{children}</tbody>
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
            a: props => {
                return <MarkdownLink {...props} />;
            },
        } satisfies MarkdownComponents;
    }, [disableImageRendering]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
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

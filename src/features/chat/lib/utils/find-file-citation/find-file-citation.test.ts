import { describe, expect, it } from "vitest";

import { findFileCitation } from "./find-file-citation";

describe("findFileCitation", () => {
    it("should return null when outputs array is empty", () => {
        const result = findFileCitation([]);
        expect(result).toBeNull();
    });

    it("should return null when no message output exists", () => {
        const outputs = [
            { type: "other", data: "something" },
            { type: "another", content: [] },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });

    it("should return null when message has no content", () => {
        const outputs = [
            {
                type: "message",
                content: [],
            },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });

    it("should return null when content has no annotations", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        text: "Some text",
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });

    it("should return null when annotations array is empty", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });

    it("should return file citation when found in first annotation", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "container_file_citation",
                                file_id: "file-123",
                                filename: "document.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);

        expect(result).toEqual({
            filename: "document.pdf",
            fileId: "file-123",
            containerId: undefined,
        });
    });

    it("should return file citation with container_id when provided", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "container_file_citation",
                                file_id: "file-456",
                                filename: "report.docx",
                                container_id: "container-789",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);

        expect(result).toEqual({
            filename: "report.docx",
            fileId: "file-456",
            containerId: "container-789",
        });
    });

    it("should return first matching citation when multiple annotations exist", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "other",
                                data: "something",
                            },
                            {
                                type: "container_file_citation",
                                file_id: "file-1",
                                filename: "first.pdf",
                            },
                            {
                                type: "container_file_citation",
                                file_id: "file-2",
                                filename: "second.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);

        expect(result).toEqual({
            filename: "first.pdf",
            fileId: "file-1",
            containerId: undefined,
        });
    });

    it("should find citation in second content item when first has none", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "other",
                                data: "something",
                            },
                        ],
                    },
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "container_file_citation",
                                file_id: "file-999",
                                filename: "found.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);

        expect(result).toEqual({
            filename: "found.pdf",
            fileId: "file-999",
            containerId: undefined,
        });
    });

    it("should find citation in second output when first has none", () => {
        const outputs = [
            {
                type: "other",
                data: "something",
            },
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "container_file_citation",
                                file_id: "file-abc",
                                filename: "second-output.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);

        expect(result).toEqual({
            filename: "second-output.pdf",
            fileId: "file-abc",
            containerId: undefined,
        });
    });

    it("should return null when annotation type doesn't match", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "output_text",
                        annotations: [
                            {
                                type: "other_citation",
                                file_id: "file-123",
                                filename: "document.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });

    it("should return null when content type doesn't match", () => {
        const outputs = [
            {
                type: "message",
                content: [
                    {
                        type: "other_text",
                        annotations: [
                            {
                                type: "container_file_citation",
                                file_id: "file-123",
                                filename: "document.pdf",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = findFileCitation(outputs);
        expect(result).toBeNull();
    });
});

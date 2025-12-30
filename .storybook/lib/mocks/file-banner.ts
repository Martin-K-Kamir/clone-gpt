export const MOCK_FILE_BANNER_URL = "https://example.com/document.pdf";
export const MOCK_FILE_BANNER_NAME = "example-document.pdf";
export const MOCK_FILE_BANNER_SIZE_DEFAULT = 1024 * 512;
export const MOCK_FILE_BANNER_TYPE_PDF = "pdf";

export const MOCK_FILE_BANNER_PDF = {
    url: "https://example.com/document.pdf",
    name: "important-document.pdf",
    size: 1024 * 2048,
    type: "pdf" as const,
};

export const MOCK_FILE_BANNER_JAVASCRIPT = {
    url: "https://example.com/script.js",
    name: "main.js",
    size: 1024 * 128,
    type: "js" as const,
};

export const MOCK_FILE_BANNER_TYPESCRIPT = {
    url: "https://example.com/component.tsx",
    name: "Button.tsx",
    size: 1024 * 64,
    type: "tsx" as const,
};

export const MOCK_FILE_BANNER_PYTHON = {
    url: "https://example.com/script.py",
    name: "data_processor.py",
    size: 1024 * 256,
    type: "py" as const,
};

export const MOCK_FILE_BANNER_CSV = {
    url: "https://example.com/data.csv",
    name: "sales-data-2024.csv",
    size: 1024 * 1024,
    type: "csv" as const,
};

export const MOCK_FILE_BANNER_EXCEL = {
    url: "https://example.com/spreadsheet.xlsx",
    name: "financial-report.xlsx",
    size: 1024 * 5120,
    type: "xlsx" as const,
};

export const MOCK_FILE_BANNER_WORD = {
    url: "https://example.com/document.docx",
    name: "meeting-notes.docx",
    size: 1024 * 1024 * 2,
    type: "docx" as const,
};

export const MOCK_FILE_BANNER_ZIP = {
    url: "https://example.com/archive.zip",
    name: "project-files.zip",
    size: 1024 * 1024 * 50,
    type: "zip" as const,
};

export const MOCK_FILE_BANNER_MARKDOWN = {
    url: "https://example.com/readme.md",
    name: "README.md",
    size: 1024 * 8,
    type: "md" as const,
};

export const MOCK_FILE_BANNER_JSON = {
    url: "https://example.com/config.json",
    name: "package.json",
    size: 1024 * 4,
    type: "json" as const,
};

export const MOCK_FILE_BANNER_WITH_DOWNLOAD = {
    url: "https://example.com/downloadable.pdf",
    name: "downloadable-file.pdf",
    size: 1024 * 1024,
    type: "pdf" as const,
};

export const MOCK_FILE_BANNER_LOADING = {
    url: "https://example.com/loading.pdf",
    name: "loading-file.pdf",
    size: 1024 * 1024,
    type: "pdf" as const,
};

export const MOCK_FILE_BANNER_LARGE = {
    url: "https://example.com/large-file.zip",
    name: "very-large-archive.zip",
    size: 1024 * 1024 * 1024 * 2,
    type: "zip" as const,
};

export const MOCK_FILE_BANNER_SMALL = {
    url: "https://example.com/tiny.txt",
    name: "tiny-file.txt",
    size: 256,
    type: "txt" as const,
};

export const MOCK_FILE_BANNER_LONG_NAME = {
    url: "https://example.com/file.pdf",
    name: "this-is-a-very-long-file-name-that-should-truncate-properly-in-the-ui.pdf",
    size: 1024 * 512,
    type: "pdf" as const,
};

export const MOCK_FILE_BANNER_UNKNOWN_TYPE = {
    url: "https://example.com/file.xyz",
    name: "unknown-file.xyz",
    size: 1024 * 128,
    type: "xyz" as const,
};

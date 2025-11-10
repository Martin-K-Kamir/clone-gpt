import { objectValuesToTuple } from "@/lib/utils";

export const MEASUREMENT_SYSTEM = {
    METRIC: "metric",
    IMPERIAL: "imperial",
} as const;

export const MEASUREMENT_SYSTEM_LIST = objectValuesToTuple(MEASUREMENT_SYSTEM);

export const OPERATING_SYSTEM = {
    WINDOWS: "windows",
    MACOS: "macOS",
    LINUX: "linux",
    ANDROID: "android",
    IOS: "iOS",
} as const;

export const OPERATING_SYSTEM_LIST = objectValuesToTuple(OPERATING_SYSTEM);

export const CODE_MIME_TYPE = {
    PHP: "application/x-php",
    RB: "application/x-ruby",
    GO: "text/x-go",
    RS: "text/x-rust",
    SQL: "application/sql",
    SH: "text/x-shellscript",
    BASH: "text/x-shellscript",
    ZSH: "text/x-shellscript",
    FISH: "text/x-shellscript",
    PS1: "text/x-powershell",
    BAT: "application/x-msdos-program",
    CMD: "application/x-msdos-program",
    R: "text/x-r",
    LUA: "text/x-lua",
    PL: "application/x-perl",
    PM: "application/x-perl",
    RKT: "text/x-scheme",
    CLJ: "text/x-clojure",
    CLJS: "text/x-clojure",
    HS: "text/x-haskell",
    ELM: "text/x-elm",
    EX: "text/x-elixir",
    EXS: "text/x-elixir",
    ERL: "text/x-erlang",
    FS: "text/x-fsharp",
    FSX: "text/x-fsharp",
    PY: "text/x-python",
    JS: "text/javascript",
    TS: "text/typescript",
    JSX: "text/javascript",
    TSX: "text/typescript",
    JAVA: "text/x-java-source",
    C: "text/x-c",
    H: "text/x-c",
    CPP: "text/x-c++",
    HPP: "text/x-c++",
    CS: "text/x-csharp",
    TEX: "application/x-tex",
    CSS: "text/css",
    SCSS: "text/x-scss",
    SASS: "text/x-sass",
    LESS: "text/x-less",
    HTML: "text/html",
    HTM: "text/html",
    SWIFT: "text/x-swift",
    KOTLIN: "text/x-kotlin",
    DART: "application/dart",
    VUE: "text/x-vue",
    SVELTE: "text/x-svelte",
} as const;

export const TEXT_MIME_TYPE = {
    TXT: "text/plain",
    MD: "text/markdown",
    MARKDOWN: "text/markdown",
    YAML: "text/yaml",
    YML: "text/yaml",
    XML: "application/xml",
    JSON: "application/json",
    JSONC: "application/json",
    CSV: "text/csv",
    RTF: "application/rtf",
} as const;

export const DOCUMENT_MIME_TYPE = {
    DOC: "application/msword",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    XLS: "application/vnd.ms-excel",
    XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    PPT: "application/vnd.ms-powerpoint",
    PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    PDF: "application/pdf",
    ODT: "application/vnd.oasis.opendocument.text",
    ODS: "application/vnd.oasis.opendocument.spreadsheet",
    ODP: "application/vnd.oasis.opendocument.presentation",
} as const;

export const ARCHIVE_MIME_TYPE = {
    ZIP: "application/zip",
    TAR: "application/x-tar",
    GZ: "application/gzip",
    GZIP: "application/gzip",
    RAR: "application/x-rar-compressed",
    SEVENZ: "application/x-7z-compressed",
    BZ2: "application/x-bzip2",
    XZ: "application/x-xz",
} as const;

export const DATA_MIME_TYPE = {
    PKL: "application/octet-stream",
} as const;

export const AUDIO_MIME_TYPE = {
    MP3: "audio/mpeg",
    WAV: "audio/wav",
    AAC: "audio/aac",
    M4A: "audio/mp4",
    OGG: "audio/ogg",
    FLAC: "audio/flac",
} as const;

export const VIDEO_MIME_TYPE = {
    MP4: "video/mp4",
    WEBM: "video/webm",
    OGG: "video/ogg",
    FLV: "video/x-flv",
    MKV: "video/x-matroska",
} as const;

export const EXECUTABLE_MIME_TYPE = {
    EXE: "application/x-msdownload",
    DLL: "application/x-msdownload",
    SO: "application/x-sharedlib",
    SH: "text/x-shellscript",
    BAT: "application/x-msdos-program",
    CMD: "application/x-msdos-program",
} as const;

export const IMAGE_MIME_TYPE = {
    JPEG: "image/jpeg",
    PNG: "image/png",
    WEBP: "image/webp",
    SVG: "image/svg+xml",
    TIFF: "image/tiff",
    AVIF: "image/avif",
    HEIC: "image/heic",
    HEIF: "image/heif",
    GIF: "image/gif",
    BMP: "image/bmp",
    ICO: "image/x-icon",
} as const;

export const MIME_TYPE = {
    TEXTS: "text/*",
    APPLICATIONS: "application/*",
    IMAGES: "image/*",
    AUDIOS: "audio/*",
    VIDEOS: "video/*",
    ...CODE_MIME_TYPE,
    ...TEXT_MIME_TYPE,
    ...DOCUMENT_MIME_TYPE,
    ...ARCHIVE_MIME_TYPE,
    ...DATA_MIME_TYPE,
    ...AUDIO_MIME_TYPE,
    ...VIDEO_MIME_TYPE,
    ...EXECUTABLE_MIME_TYPE,
    ...IMAGE_MIME_TYPE,
} as const;

export const CODE_MIME_TYPES_LIST = objectValuesToTuple(CODE_MIME_TYPE);
export const TEXT_MIME_TYPES_LIST = objectValuesToTuple(TEXT_MIME_TYPE);
export const DOCUMENT_MIME_TYPES_LIST = objectValuesToTuple(DOCUMENT_MIME_TYPE);
export const ARCHIVE_MIME_TYPES_LIST = objectValuesToTuple(ARCHIVE_MIME_TYPE);
export const DATA_MIME_TYPES_LIST = objectValuesToTuple(DATA_MIME_TYPE);
export const AUDIO_MIME_TYPES_LIST = objectValuesToTuple(AUDIO_MIME_TYPE);
export const VIDEO_MIME_TYPES_LIST = objectValuesToTuple(VIDEO_MIME_TYPE);
export const EXECUTABLE_MIME_TYPES_LIST =
    objectValuesToTuple(EXECUTABLE_MIME_TYPE);
export const IMAGE_MIME_TYPES_LIST = objectValuesToTuple(IMAGE_MIME_TYPE);
export const MIME_TYPES_LIST = objectValuesToTuple(MIME_TYPE);

export const CODE_FILE_EXTENSION = {
    PHP: ".php",
    RB: ".rb",
    GO: ".go",
    RS: ".rs",
    SQL: ".sql",
    SH: ".sh",
    BASH: ".bash",
    ZSH: ".zsh",
    FISH: ".fish",
    PS1: ".ps1",
    BAT: ".bat",
    CMD: ".cmd",
    R: ".r",
    LUA: ".lua",
    PL: ".pl",
    PM: ".pm",
    RKT: ".rkt",
    CLJ: ".clj",
    CLJS: ".cljs",
    HS: ".hs",
    ELM: ".elm",
    EX: ".ex",
    EXS: ".exs",
    ERL: ".erl",
    FS: ".fs",
    FSX: ".fsx",
    PY: ".py",
    JS: ".js",
    TS: ".ts",
    JSX: ".jsx",
    TSX: ".tsx",
    JAVA: ".java",
    C: ".c",
    H: ".h",
    CPP: ".cpp",
    HPP: ".hpp",
    CS: ".cs",
    TEX: ".tex",
    CSS: ".css",
    SCSS: ".scss",
    SASS: ".sass",
    LESS: ".less",
    HTML: ".html",
    HTM: ".htm",
    SWIFT: ".swift",
    KOTLIN: ".kt",
    DART: ".dart",
    VUE: ".vue",
    SVELTE: ".svelte",
} as const;

export const TEXT_FILE_EXTENSION = {
    TXT: ".txt",
    MD: ".md",
    MARKDOWN: ".markdown",
    YAML: ".yaml",
    YML: ".yml",
    XML: ".xml",
    JSON: ".json",
    JSONC: ".jsonc",
    CSV: ".csv",
    RTF: ".rtf",
} as const;

export const DOCUMENT_FILE_EXTENSION = {
    DOC: ".doc",
    DOCX: ".docx",
    XLS: ".xls",
    XLSX: ".xlsx",
    PPT: ".ppt",
    PPTX: ".pptx",
    PDF: ".pdf",
    ODT: ".odt",
    ODS: ".ods",
    ODP: ".odp",
} as const;

export const ARCHIVE_FILE_EXTENSION = {
    ZIP: ".zip",
    TAR: ".tar",
    GZ: ".gz",
    GZIP: ".gzip",
    RAR: ".rar",
    SEVENZ: ".7z",
    BZ2: ".bz2",
    XZ: ".xz",
} as const;

export const DATA_FILE_EXTENSION = {
    PKL: ".pkl",
} as const;

export const AUDIO_FILE_EXTENSION = {
    MP3: ".mp3",
    WAV: ".wav",
    AAC: ".aac",
    M4A: ".m4a",
    OGG: ".ogg",
    FLAC: ".flac",
} as const;

export const VIDEO_FILE_EXTENSION = {
    MP4: ".mp4",
    WEBM: ".webm",
    OGG: ".ogg",
    FLV: ".flv",
    MKV: ".mkv",
} as const;

export const EXECUTABLE_FILE_EXTENSION = {
    EXE: ".exe",
    DLL: ".dll",
    SO: ".so",
    SH: ".sh",
    BAT: ".bat",
    CMD: ".cmd",
} as const;

export const IMAGE_FILE_EXTENSION = {
    JPEG: ".jpeg",
    PNG: ".png",
    WEBP: ".webp",
    SVG: ".svg",
    TIFF: ".tiff",
    AVIF: ".avif",
    HEIC: ".heic",
    HEIF: ".heif",
    GIF: ".gif",
    BMP: ".bmp",
    ICO: ".ico",
} as const;

export const FILE_EXTENSION = {
    ...CODE_FILE_EXTENSION,
    ...TEXT_FILE_EXTENSION,
    ...DOCUMENT_FILE_EXTENSION,
    ...ARCHIVE_FILE_EXTENSION,
    ...DATA_FILE_EXTENSION,
    ...AUDIO_FILE_EXTENSION,
    ...VIDEO_FILE_EXTENSION,
    ...EXECUTABLE_FILE_EXTENSION,
    ...IMAGE_FILE_EXTENSION,
} as const;

export const CODE_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(CODE_FILE_EXTENSION);
export const TEXT_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(TEXT_FILE_EXTENSION);
export const DOCUMENT_FILE_EXTENSIONS_LIST = objectValuesToTuple(
    DOCUMENT_FILE_EXTENSION,
);
export const ARCHIVE_FILE_EXTENSIONS_LIST = objectValuesToTuple(
    ARCHIVE_FILE_EXTENSION,
);
export const DATA_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(DATA_FILE_EXTENSION);
export const AUDIO_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(AUDIO_FILE_EXTENSION);
export const VIDEO_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(VIDEO_FILE_EXTENSION);
export const EXECUTABLE_FILE_EXTENSIONS_LIST = objectValuesToTuple(
    EXECUTABLE_FILE_EXTENSION,
);
export const FILE_EXTENSIONS_LIST = objectValuesToTuple(FILE_EXTENSION);
export const IMAGE_FILE_EXTENSIONS_LIST =
    objectValuesToTuple(IMAGE_FILE_EXTENSION);

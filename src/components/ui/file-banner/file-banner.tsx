import {
    IconFile,
    IconFileCode,
    IconFileTypeCss,
    IconFileTypeCsv,
    IconFileTypeDoc,
    IconFileTypeDocx,
    IconFileTypeHtml,
    IconFileTypeJs,
    IconFileTypeJsx,
    IconFileTypePdf,
    IconFileTypePhp,
    IconFileTypePpt,
    IconFileTypeRs,
    IconFileTypeSql,
    IconFileTypeTs,
    IconFileTypeTsx,
    IconFileTypeTxt,
    IconFileTypeVue,
    IconFileTypeXls,
    IconFileTypeXml,
    IconFileTypeZip,
    IconLoader2,
} from "@tabler/icons-react";
import { memo } from "react";

import { cn, downloadBlob, formatBytesSize } from "@/lib/utils";

const fileTypeIcons = {
    pdf: IconFileTypePdf,
    csv: IconFileTypeCsv,
    xls: IconFileTypeXls,
    xlsx: IconFileTypeXls,
    docx: IconFileTypeDocx,
    doc: IconFileTypeDoc,
    ppt: IconFileTypePpt,
    pptx: IconFileTypePpt,
    txt: IconFileTypeTxt,
    html: IconFileTypeHtml,
    css: IconFileTypeCss,
    js: IconFileTypeJs,
    ts: IconFileTypeTs,
    tsx: IconFileTypeTsx,
    jsx: IconFileTypeJsx,
    php: IconFileTypePhp,
    sql: IconFileTypeSql,
    xml: IconFileTypeXml,
    zip: IconFileTypeZip,
    tar: IconFileTypeZip,
    gz: IconFileTypeZip,
    gzip: IconFileTypeZip,
    vue: IconFileTypeVue,
    rs: IconFileTypeRs,
    md: IconFileTypeTxt,
    markdown: IconFileTypeTxt,
    yaml: IconFileTypeTxt,
    yml: IconFileTypeTxt,
    json: IconFileTypeJs,
    jsonc: IconFileTypeJs,
    rtf: IconFileTypeDoc,
    odt: IconFileTypeDoc,
    ods: IconFileTypeXls,
    odp: IconFileTypePpt,
    htm: IconFileTypeHtml,
    scss: IconFileTypeCss,
    sass: IconFileTypeCss,
    less: IconFileTypeCss,
    py: IconFileCode,
    rb: IconFileCode,
    go: IconFileCode,
    java: IconFileCode,
    c: IconFileCode,
    h: IconFileCode,
    cpp: IconFileCode,
    hpp: IconFileCode,
    cs: IconFileCode,
    sh: IconFileCode,
    bash: IconFileCode,
    zsh: IconFileCode,
    fish: IconFileCode,
    ps1: IconFileCode,
    bat: IconFileCode,
    cmd: IconFileCode,
    r: IconFileCode,
    lua: IconFileCode,
    pl: IconFileCode,
    pm: IconFileCode,
    rkt: IconFileCode,
    clj: IconFileCode,
    cljs: IconFileCode,
    hs: IconFileCode,
    elm: IconFileCode,
    ex: IconFileCode,
    exs: IconFileCode,
    erl: IconFileCode,
    fs: IconFileCode,
    fsx: IconFileCode,
    swift: IconFileCode,
    kt: IconFileCode,
    dart: IconFileCode,
    svelte: IconFileCode,
    tex: IconFileCode,
    pkl: IconFileCode,

    default: IconFile,
};

const fileTypeColors = {
    pdf: "#DC2626",
    docx: "#1E40AF",
    doc: "#1E40AF",
    odt: "#1E40AF",
    rtf: "#1E40AF",
    csv: "#047857",
    xlsx: "#065F46",
    xls: "#065F46",
    ods: "#065F46",
    json: "#D97706",
    jsonc: "#D97706",
    xml: "#6D28D9",
    html: "#EA580C",
    htm: "#EA580C",
    css: "#2563EB",
    scss: "#BF4080",
    sass: "#BF4080",
    less: "#2563EB",
    js: "#E0B636",
    jsx: "#EA580C",
    ts: "#1D4ED8",
    tsx: "#1D4ED8",
    py: "#3776AB",
    php: "#6B47D6",
    java: "#DC3545",
    c: "#1976D2",
    h: "#9C27B0",
    cpp: "#00599C",
    hpp: "#9C27B0",
    cs: "#239120",
    rb: "#CC342D",
    go: "#00ADD8",
    rs: "#000000",
    swift: "#FF6347",
    kt: "#F88909",
    dart: "#0175C2",
    vue: "#2E7D32",
    svelte: "#D32F2F",
    sql: "#336791",
    sh: "#4CAF50",
    bash: "#4CAF50",
    zsh: "#4CAF50",
    fish: "#4CAF50",
    ps1: "#0078D4",
    bat: "#0078D4",
    cmd: "#0078D4",
    zip: "#6D28D9",
    tar: "#6D28D9",
    gz: "#6D28D9",
    gzip: "#6D28D9",
    md: "#083FA1",
    markdown: "#083FA1",
    yaml: "#CB171E",
    yml: "#CB171E",
    tex: "#1DA5B4",
    r: "#276DC3",
    lua: "#3A66A7",
    pl: "#39457E",
    pm: "#39457E",
    rkt: "#3F5AA9",
    clj: "#5881D8",
    cljs: "#63B132",
    hs: "#5D4F85",
    elm: "#1293D8",
    ex: "#6E4B9E",
    exs: "#6E4B9E",
    erl: "#A90533",
    fs: "#378BBA",
    fsx: "#378BBA",
    ppt: "#F7630C",
    pptx: "#F7630C",
    odp: "#F7630C",
    pkl: "#7A42F4",

    default: "#4B5563",
};

type FileBannerProps = {
    url: string;
    name: string;
    size: number;
    type: string;
    download?: boolean;
    isLoading?: boolean;
} & React.ComponentProps<"div">;

export function FileBanner({
    url,
    name,
    size,
    type,
    className,
    isLoading,
    download = false,
    onClick,
    ...props
}: FileBannerProps) {
    const normalizedType = type.toLowerCase();
    const IconComponent =
        fileTypeIcons[normalizedType as keyof typeof fileTypeIcons] ||
        fileTypeIcons.default;
    const color =
        fileTypeColors[normalizedType as keyof typeof fileTypeColors] ||
        fileTypeColors.default;

    return (
        <div
            className={cn(
                "max-w-74 flex w-full items-center gap-3 rounded-2xl border border-zinc-700 p-3",
                download && "cursor-pointer hover:bg-zinc-700/50",
                className,
            )}
            onClick={e => {
                onClick?.(e);

                if (download) {
                    downloadBlob({ name, src: url });
                }
            }}
            {...props}
        >
            <div
                className="flex size-10 shrink-0 items-center justify-center rounded-md"
                style={{
                    backgroundColor: color,
                }}
            >
                {isLoading ? (
                    <IconLoader2 className="size-5 animate-spin" />
                ) : (
                    <IconComponent />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="truncate text-xs text-zinc-400">
                    {formatBytesSize(size)}
                </p>
            </div>
        </div>
    );
}

export const MemoizedFileBanner = memo(FileBanner);
export const HardMemoizedFileBanner = memo(FileBanner, () => true);

import {
    GENERATE_CODE_SUPPORTED_EXTENSIONS,
    GENERATE_FILE_SUPPORTED_EXTENSIONS,
} from "@/features/chat/lib/constants/ai";

import {
    IMAGE_FILE_EXTENSIONS_LIST,
    VIDEO_FILE_EXTENSIONS_LIST,
} from "@/lib/constants";
import { getFileExtension } from "@/lib/utils";

type ImageFileExtension = (typeof IMAGE_FILE_EXTENSIONS_LIST)[number];
type VideoFileExtension = (typeof VIDEO_FILE_EXTENSIONS_LIST)[number];
type GenerateFileExtension =
    (typeof GENERATE_FILE_SUPPORTED_EXTENSIONS)[number];
type GenerateCodeExtension =
    (typeof GENERATE_CODE_SUPPORTED_EXTENSIONS)[number];

type CheckFileResult =
    | {
          supported: false;
          reason: string;
          suggestion?: string;
      }
    | {
          supported: true;
          handler: "generateCode" | "interpretCode";
      };

export function getFileGenerationHandler(filename: string): CheckFileResult {
    const extension = getFileExtension(filename);
    const extinsionWithDot = `.${extension}`.toLowerCase();

    if (!extension) {
        return {
            supported: false,
            reason: "File must have an extension",
        };
    }

    const supportedExtensions = GENERATE_FILE_SUPPORTED_EXTENSIONS;

    if (
        !supportedExtensions.includes(extinsionWithDot as GenerateFileExtension)
    ) {
        if (
            IMAGE_FILE_EXTENSIONS_LIST.includes(
                extinsionWithDot as ImageFileExtension,
            )
        ) {
            return {
                supported: false,
                reason: `Image files (${extinsionWithDot}) are not supported by the generate file tool`,
                suggestion:
                    "Use the generateImage tool instead for image generation",
            };
        }

        if (
            VIDEO_FILE_EXTENSIONS_LIST.includes(
                extinsionWithDot as VideoFileExtension,
            )
        ) {
            return {
                supported: false,
                reason: `Video files (${extinsionWithDot}) are not supported by the generate file tool`,
                suggestion: "Video generation is not currently available",
            };
        }

        return {
            supported: false,
            reason: `File type ${extinsionWithDot} is not supported by the generate file tool`,
            suggestion: `Supported extensions: ${supportedExtensions.join(", ")}`,
        };
    }

    const handler = GENERATE_CODE_SUPPORTED_EXTENSIONS.includes(
        extinsionWithDot as GenerateCodeExtension,
    )
        ? "generateCode"
        : "interpretCode";

    return {
        handler,
        supported: true,
    };
}

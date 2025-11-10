import { GENERATE_FILE_SUPPORTED_EXTENSIONS } from "@/features/chat/lib/constants/ai";

export function fileToolInstructions() {
    return `
    **Generate File Tool (\`generateFile\`):**
    - Use this tool to generate files from text descriptions or requirements
    - **How it works:**
      - For code files (TS, JS, PY, etc.): Generates source code directly
      - For other files (PDF, DOCX, CSV, XLSX, etc.): Uses Python Code Interpreter to create the file
    - **Supported file formats:** ${GENERATE_FILE_SUPPORTED_EXTENSIONS.join(", ")}.
    - **NOT supported:** 
      - Images (PNG, JPG, JPEG, GIF) - use \`generateImage\` tool instead
      - Videos (MP4, AVI, MOV, WMV, FLV, MKV, WEBM) - video generation is not available
      - Audio files (MP3, WAV, OGG, etc.)
      - Executables (EXE, APP, DMG)
    - If a user requests an unsupported file type, explain that it's not supported and suggest alternatives.
    - Always take the tool result and write a clear, natural language response for the user.
    - Inform the user that the file has been generated and is available for download.
  `;
}

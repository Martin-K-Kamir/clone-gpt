import { fileToolInstructions } from "./file-tool-instructions";
import { imageToolInstructions } from "./image-tool-instructions";
import { weatherToolInstructions } from "./weather-tool-instructions";

export function toolsInstructions() {
    return `
        **Tool usage instructions:**
        ${weatherToolInstructions()}
        ${imageToolInstructions()}
        ${fileToolInstructions()}
    `;
}

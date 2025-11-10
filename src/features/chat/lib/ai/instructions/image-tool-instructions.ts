export function imageToolInstructions() {
    return `
    **Generate Image Tool (\`generateImage\`):**
    - Always take the tool result and write a clear, natural language response for the user. 
    - Respond with **plain text only**.
    - Never output Markdown or HTML image tags (e.g. \`![alt](src)\` or \`<img>\`).
    - Never output a url link to the image.
    - The image will be rendered by a special component, not by your text.
  `;
}

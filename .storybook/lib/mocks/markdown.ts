export const MARKDOWN_DEFAULT =
    "This is a **bold** text and this is *italic* text.";

export const MARKDOWN_HEADINGS = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6`;

export const MARKDOWN_TEXT_FORMATTING = `This is **bold text** and this is *italic text*.

You can also use ***bold and italic*** together.

Here's some \`inline code\` in a sentence.

And here's ~~strikethrough text~~.`;

export const MARKDOWN_LISTS = `### Unordered List

- First item
- Second item
- Third item
  - Nested item
  - Another nested item
- Fourth item

### Ordered List

1. First item
2. Second item
3. Third item
   1. Nested item
   2. Another nested item
4. Fourth item`;

export const MARKDOWN_CODE_BLOCK_JAVASCRIPT = `\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\``;

export const MARKDOWN_CODE_BLOCK_TYPESCRIPT = `\`\`\`typescript
interface User {
    id: string;
    name: string;
    email: string;
}

const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
};
\`\`\``;

export const MARKDOWN_CODE_BLOCK_PYTHON = `\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\``;

export const MARKDOWN_TABLE = `| Name | Age | City | Occupation |
|------|-----|------|------------|
| John Doe | 28 | New York | Developer |
| Jane Smith | 32 | San Francisco | Designer |
| Bob Johnson | 45 | Chicago | Manager |
| Alice Williams | 29 | Boston | Engineer |`;

export const MARKDOWN_LINK_GITHUB =
    "Visit [GitHub](https://github.com) for open source projects.";

export const MARKDOWN_LINK_REACT =
    "Check out [React documentation](https://react.dev) to learn more.";

export const MARKDOWN_LINK_CUSTOM =
    "Here's a link with [custom text](https://example.com) that opens in a new tab.";

export const MARKDOWN_BLOCKQUOTES = `> This is a blockquote.
> It can span multiple lines.
> 
> And can include **formatting** like *italic* text.

> You can also nest blockquotes:
> > This is a nested blockquote.
> > It's indented further.`;

export const MARKDOWN_HORIZONTAL_RULE = `Content above the line

---

Content below the line`;

export const MARKDOWN_MIXED_CONTENT = `# Getting Started

This guide will help you get started with our project.

## Installation

To install the package, run:

\`\`\`bash
npm install package-name
\`\`\`

## Features

- **Feature 1**: Description of feature 1
- **Feature 2**: Description of feature 2
- **Feature 3**: Description of feature 3

## Usage

Here's a simple example:

\`\`\`typescript
import { Component } from 'package-name';

function App() {
    return <Component />;
}
\`\`\`

## Data Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |

> **Note**: This is an important note about the usage.

For more information, visit our [documentation](https://example.com/docs).`;

export const MARKDOWN_WITH_IMAGES = `# Image Example

Here's an image:

![Sample Image](https://picsum.photos/seed/markdown1/800/400)

You can also add images with links:

[![Linked Image](https://picsum.photos/seed/markdown2/600/300)](https://example.com)

Here's another example with a different image:

![Nature](https://picsum.photos/seed/markdown3/800/400)`;

export const MARKDOWN_IMAGES_DISABLED = `# Image Example (Disabled)

This markdown contains an image, but image rendering is disabled:

![Sample Image](https://picsum.photos/seed/markdown-disabled/800/400)

The image should not be displayed.`;

export const MARKDOWN_COMPLEX_EXAMPLE = `# Complete Markdown Guide

This document demonstrates all the features of the Markdown component.

## Text Formatting

You can use **bold**, *italic*, ***bold and italic***, \`code\`, and ~~strikethrough~~.

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

## Code Examples

### Inline Code
Use \`console.log()\` for debugging.

### Code Block
\`\`\`javascript
// Example function
function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 3);
console.log(result); // Output: 8
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Code Blocks | ✅ | With syntax highlighting |
| Tables | ✅ | With copy/download |
| Links | ✅ | External links open in new tab |
| Images | ✅ | Can be disabled |

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Links

- [GitHub](https://github.com)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/)

---

**End of document**`;

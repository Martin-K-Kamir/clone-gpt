# Storybook Patterns and Conventions

This document outlines the patterns, conventions, and best practices for writing Storybook stories and tests in this codebase.

## Table of Contents

- [Story Structure](#story-structure)
- [Test Naming Conventions](#test-naming-conventions)
- [Mock Data](#mock-data)
- [Element Queries](#element-queries)
- [Test Helpers](#test-helpers)
- [Decorators](#decorators)
- [MSW Handlers](#msw-handlers)
- [Query Client Management](#query-client-management)

## Story Structure

### Basic Story Structure

```tsx
import {
    WithQueryProvider,
    createMockUser,
    getButton,
    waitForDialog,
} from "#.storybook/lib";
import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { MyComponent } from "./my-component";

const meta = preview.meta({
    component: MyComponent,
    decorators: [
        Story => (
            <WithQueryProvider>
                <Story />
            </WithQueryProvider>
        ),
    ],
    parameters: {
        a11y: {
            test: "error",
        },
    },
});

export const Default = meta.story({
    args: {
        onClick: fn(),
    },
});

Default.test("should render component", async ({ canvas }) => {
    expect(canvas.getByRole("button")).toBeInTheDocument();
});
```

### Story Naming

- Use PascalCase for story names: `Default`, `WithData`, `Loading`, `Empty`
- Use descriptive names that indicate the story's purpose
- Common patterns:
    - `Default` - The default/standard story
    - `Loading` - Loading state
    - `Empty` - Empty state
    - `WithData` - Story with data
    - `Error` - Error state
    - `Disabled` - Disabled state

#### Naming Conventions

**Standard Patterns:**

1. **Default Story**: Always use `Default` for the base/default story
2. **WithXxx Pattern**: Use `WithXxx` for stories that add features/data
    - ✅ `WithDescription`, `WithAction`, `WithGroups`, `WithIcons`
    - ✅ `WithInitialValue`, `WithFileTypes`, `WithCustomContent`
3. **WithoutXxx Pattern**: Use `WithoutXxx` for stories that remove features
    - ✅ `WithoutFileButton`, `WithoutCancelButton`, `WithoutIcon`
    - ❌ Avoid `NoXxx` - use `WithoutXxx` instead for consistency
4. **Size Stories**: Use `SizeXxx` prefix for size variations
    - ✅ `SizeNone`, `SizeXs`, `SizeSm`, `SizeLg` (button)
    - ❌ Avoid `SizeSmall` - use `SizeSm` instead
    - ❌ Avoid `Large`/`Small` without prefix - use `SizeLg`/`SizeSm`
5. **Position Stories**: Use `SideXxx` prefix for positioning
    - ✅ `SideRight`, `SideLeft`, `SideTop`, `SideBottom` (sheet, dropdown)
    - ❌ Avoid `Top`/`Bottom`/`Left`/`Right` without prefix - use `SideXxx`
6. **State Stories**: Use simple state names
    - ✅ `Loading`, `Disabled`, `Error`, `Empty`
7. **Variant Stories**: Use descriptive variant names
    - ✅ `Destructive`, `Outline`, `Secondary` (button variants)
    - ✅ `VariantSidebar`, `VariantInset` (when component has explicit variants)
8. **Controlled Stories**: Use `Controlled` for controlled component examples
9. **Custom Stories**: Use `CustomXxx` for custom configurations
    - ✅ `CustomDuration`, `CustomWidth`, `CustomStyling`
10. **Type/Format Stories**: Use descriptive names for types
    - ✅ `Email`, `Password`, `Number` (input types)
    - ✅ `WithCelsius`, `WithFahrenheit` (temperature formats)
11. **Dialog Context**: Use `InDialogXxx` prefix for dialog-specific stories
    - ✅ `InDialogDefault`, `InDialogWithItems`, `InDialogWithSearchResults`

## Test Naming Conventions

### Format

All test names should follow the pattern: `"should [action/state]"`

### Examples

✅ **Good:**

- `"should render component"`
- `"should open dialog when button is clicked"`
- `"should display error message"`
- `"should handle form submission"`
- `"should navigate to next page"`

❌ **Bad:**

- `"renders component"` (missing "should")
- `"opens dialog"` (missing "should")
- `"test button click"` (use "should handle button click" instead)
- `"component renders"` (use "should render component" instead)

### Test Organization

- Group related tests together
- Use descriptive test names that explain what is being tested
- One assertion per test when possible, or group related assertions

## Mock Data

### Stable and Fixed Data

**CRITICAL**: All mock data must be **stable and fixed** (no random values). This is essential for visual testing - if data changes between renders, visual regression tests will fail.

**Rules:**

- ✅ Use fixed dates: `FIXED_DATE`, `FIXED_MESSAGE_DATE`, `FIXED_WEATHER_START_DATE`
- ✅ Use fixed IDs: `MOCK_USER_ID`, `MOCK_CHAT_ID`, `MOCK_MESSAGE_ID`
- ✅ Use deterministic data generation (based on index, not random)
- ❌ Never use `Math.random()`, `Date.now()`, `new Date()` without fixed base
- ❌ Never use `crypto.randomUUID()` or similar random generators

```tsx
import {
    FIXED_DATE,
    MOCK_CHAT_ID,
    MOCK_USER_ID,
    createMockChat,
} from "#.storybook/lib/mocks";

// ✅ Good - uses fixed constants
const chat = createMockChat(0);
const chatId = MOCK_CHAT_ID;
const date = FIXED_DATE;

// ❌ Bad - random or unstable data
const chatId = crypto.randomUUID();
const date = new Date().toISOString();
const randomValue = Math.random();

// ❌ Bad - hardcoded status strings
const status = "ready" as ChatStatus;
const status2 = "streaming" as ChatStatus;

// ✅ Good - use status constants
const status = MOCK_CHAT_STATUS.READY;
const status2 = MOCK_CHAT_STATUS.STREAMING;
```

### Using Shared Mocks

Always use shared mock factories from `#.storybook/lib/mocks` instead of creating inline mocks.

```tsx
import {
    createMockUser,
    createMockChat,
    createMockChats,
    createMockUserMessage,
    createMockAssistantMessage,
    MOCK_CHAT_ID,
    FIXED_DATE,
} from "#.storybook/lib/mocks";

// ✅ Good
const user = createMockUser();
const chat = createMockChat(0);
const chats = createMockChats(10);
const chatId = MOCK_CHAT_ID;
const date = FIXED_DATE;

// ❌ Bad
const user = {
    id: "123",
    name: "Test User",
    // ...
};
const chatId = "chat-123" as DBChatId; // Should use MOCK_CHAT_ID
const date = new Date("2025-01-01").toISOString(); // Should use FIXED_DATE
const message = MOCK_CONVERSATION_WITH_MULTIPLE_FILES[0]; // Should use MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES
const parts = MOCK_CONVERSATION_WITH_MULTIPLE_FILES[0].parts.filter(p => p.type === "file"); // Should use MOCK_FILE_PARTS_MULTIPLE

// ✅ Good - use pre-configured constants
const message = MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES;
const parts = MOCK_FILE_PARTS_MULTIPLE;
```

### No Raw Data in Stories

**CRITICAL**: Never define raw mock data (objects, arrays, constants) directly in story files. All mock data must be defined in the mocks directory (`#.storybook/lib/mocks`) and imported into stories.

**Rules:**

- ✅ All mock data constants must be in `#.storybook/lib/mocks` files
- ✅ Stories should only import and use mock constants/factories
- ❌ Never define raw objects, arrays, or constants in story files
- ❌ Never inline mock data creation in story files

```tsx
// ❌ Bad - raw data in story file
const mockSourceParts = [
    { type: "source-url", url: "https://example.com", title: "Example" },
];
const mockPreviews = [{ url: "https://example.com", title: "Example" }];

// ✅ Good - import from mocks
import { MOCK_SOURCE_PARTS, MOCK_SOURCE_PREVIEWS } from "#.storybook/lib/mocks/messages";

// ❌ Bad - inline factory calls with raw data
const parts = createMockSourceUrlMessageParts([
    { url: "https://example.com", title: "Example" },
]);

// ✅ Good - use pre-configured constants
const parts = MOCK_SOURCE_PARTS;
```

**Exception**: Simple, one-off test data that is truly story-specific and won't be reused can be created inline, but prefer moving to mocks if it's more than a simple primitive value.

### Available Constants

- `MOCK_USER_ID` - Fixed user ID
- `MOCK_CHAT_ID` - Fixed chat ID
- `MOCK_MESSAGE_ID` - Fixed message ID
- `MOCK_ASSISTANT_MESSAGE_ID` - Fixed assistant message ID
- `FIXED_DATE` - Fixed date string (2025-01-01T00:00:00.000Z)
- `FIXED_MESSAGE_DATE` - Fixed message date string (2024-01-15T12:00:00.000Z)
- `FIXED_WEATHER_START_DATE` - Fixed weather start date
- `MOCK_CHAT_STATUS` - Chat status constants object:
    - `MOCK_CHAT_STATUS.READY` - Ready status
    - `MOCK_CHAT_STATUS.STREAMING` - Streaming status
    - `MOCK_CHAT_STATUS.SUBMITTED` - Submitted status
    - `MOCK_CHAT_STATUS.ERROR` - Error status

### Available Mock Factories

#### Users

- `createMockUser(overrides?)` - Creates a mock user
- `createMockUsers(count)` - Creates multiple mock users
- `createMockGuestUser()` - Creates a guest user
- `createMockAdminUser()` - Creates an admin user

#### Chats

- `createMockChat(index, overrides?)` - Creates a mock chat
- `createMockChats(count, overrides?)` - Creates multiple mock chats
- `createMockPaginatedChats(length, hasNextPage?)` - Creates paginated chat data
- `createMockPrivateChat(index)` - Creates a private chat
- `createMockPublicChat(index)` - Creates a public chat

#### Messages

- `createMockUserMessage(text, messageId?)` - Creates a user message
- `createMockAssistantMessage(text, messageId?)` - Creates an assistant message
- `createMockUserMessageWithFiles(text, files, messageId?)` - Creates a user message with files
- `createMockMessages(count, baseText?)` - Creates alternating user/assistant messages
- `createMockTextMessagePart(text)` - Creates a text message part
- `createMockFileMessagePart(options?)` - Creates a file message part
- `createMockImageMessagePart(options?)` - Creates an image message part
- `createMockFileMessageParts(count, baseName?, extension?)` - Creates multiple file message parts
- `createMockImageMessageParts(count, baseName?, extension?)` - Creates multiple image message parts

#### Message Examples (Pre-configured Messages)

- `MOCK_USER_MESSAGE_WITH_SINGLE_FILE` - User message with single file
- `MOCK_USER_MESSAGE_WITH_SINGLE_IMAGE` - User message with single image
- `MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES` - User message with multiple files
- `MOCK_USER_MESSAGE_WITH_MULTIPLE_IMAGES` - User message with multiple images
- `MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE` - Assistant message with generated image
- `MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE` - Assistant message with generated file
- `MOCK_ASSISTANT_MESSAGE_WITH_WEATHER` - Assistant message with weather tool
- `MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN` - Assistant message with markdown content
- `MOCK_ASSISTANT_MESSAGE_WITH_IMAGE_ANALYSIS` - Assistant message with image analysis
- `MOCK_ASSISTANT_MESSAGE_WITH_REFERENCE_IMAGE` - Assistant message with reference image

#### Message Parts (Filtered)

- `MOCK_FILE_PARTS_SINGLE` - Single file part
- `MOCK_FILE_PARTS_MULTIPLE` - Multiple file parts
- `MOCK_IMAGE_PARTS_SINGLE` - Single image part
- `MOCK_IMAGE_PARTS_MULTIPLE` - Multiple image parts
- `MOCK_FILE_AND_IMAGE_PARTS` - Combined file and image parts
- `MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES` - Assistant message parts with source URLs
- `MOCK_TOOL_PARTS_WEATHER` - Weather tool parts
- `MOCK_TOOL_PARTS_GENERATE_IMAGE` - Generate image tool parts
- `MOCK_TOOL_PARTS_GENERATE_FILE` - Generate file tool parts

#### Source URL Parts

- `MOCK_SOURCE_PARTS` - Default source URL message parts (3 sources: Next.js, React, Tailwind CSS)
- `MOCK_ADDITIONAL_SOURCE_PARTS` - Additional source URL message parts (TypeScript, Node.js)
- `MOCK_SOURCE_PREVIEWS` - Source preview data for API responses (3 previews matching MOCK_SOURCE_PARTS)
- `MOCK_ADDITIONAL_SOURCE_PREVIEWS` - Additional source preview data (TypeScript, Node.js)

#### Files

- `createColoredImageFile(color, filename, width?, height?)` - Creates a colored image file
- `createColoredImageFiles(colors?, filenames?)` - Creates multiple colored image files
- `createTextFile(content, filename?)` - Creates a text file
- `createPDFFile(filename?)` - Creates a PDF file

## Element Queries

### Using Element Query Utilities

**Important**: Only create utility functions for elements that require `document.querySelector` or complex DOM traversal. Do NOT create wrappers for simple canvas methods like `canvas.getByRole()` or `canvas.getByText()`.

Use the element query utilities from `#.storybook/lib/utils/elements` for elements that require DOM queries.

```tsx
import {
    getDialog,
    getDialogOverlay,
    getDialogCloseButton,
    getTooltip,
    getInputPlaceholderText,
} from "#.storybook/lib/utils/elements";

// ✅ Good - uses document.querySelector
const dialog = getDialog("dialog");
const overlay = getDialogOverlay();
const tooltip = getTooltip();
const placeholderText = getInputPlaceholderText();

// ✅ Good - direct canvas methods (no wrapper needed)
const button = canvas.getByRole("button", { name: /submit/i });
const input = canvas.getByRole("textbox");
const heading = canvas.getByRole("heading", { level: 1 });

// ❌ Bad - don't create wrappers for canvas methods
const button = getButton(canvas, /submit/i); // Don't do this
```

### Available Element Queries

These utilities use `document.querySelector` for elements that are not easily accessible via canvas:

- `getDialog(role?)` - Get a dialog element by role
- `getDialogOverlay()` - Get dialog overlay element
- `getDialogCloseButton()` - Get dialog close button
- `getDialogTitle()` - Get dialog title element
- `getDropdownMenu()` - Get dropdown menu content
- `getTooltip()` - Get tooltip content
- `getInputPlaceholderText()` - Get animated placeholder text from input

## Test Helpers

### Using Test Helpers

Use test helpers from `#.storybook/lib/utils/test-helpers` for common test patterns.

```tsx
import {
    clickAndWait,
    waitForDialog,
    waitForDialogToClose,
    waitForDropdownMenu,
} from "#.storybook/lib/utils/test-helpers";

// ✅ Good
await waitForDialog("dialog");
await clickAndWait(button, userEvent, async () => {
    await waitForDialogToClose();
});

// ❌ Bad
await waitFor(() => {
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
});
```

### Available Test Helpers

- `waitForElement(selector, options?)` - Wait for element to appear
- `waitForElementToDisappear(selector, options?)` - Wait for element to disappear
- `waitForDialog(role?, options?)` - Wait for dialog to appear
- `waitForDialogToClose(role?, options?)` - Wait for dialog to close
- `waitForDialogOverlay(options?)` - Wait for dialog overlay to appear
- `waitForDialogCloseButton(options?)` - Wait for dialog close button to appear
- `waitForDialogTitle(options?)` - Wait for dialog title to appear
- `waitForDropdownMenu(options?)` - Wait for dropdown menu to appear
- `waitForDropdownMenuToClose(options?)` - Wait for dropdown menu to close
- `waitForTooltip(options?)` - Wait for tooltip to appear
- `waitForText(canvas, text, options?)` - Wait for text to appear
- `clickAndWait(element, userEvent, waitCondition)` - Click and wait for condition
- `typeAndWait(input, text, userEvent, waitCondition?)` - Type and wait
- `findButtonByText(text)` - Find button by text content
- `findInputByName(name)` - Find input by name attribute
- `findInputByType(type)` - Find input by type

## Decorators

### Using Decorators

Use decorators from `#.storybook/lib/decorators` for common provider setups.

```tsx
import {
    WithQueryProviderAndToaster,
    withChatProviders,
    withChatProvidersAndToaster,
} from "#.storybook/lib/decorators";

const meta = preview.meta({
    component: MyComponent,
    decorators: [
        Story => (
            <WithQueryProviderAndToaster>
                <Story />
            </WithQueryProviderAndToaster>
        ),
    ],
});
```

### Available Decorators

- `WithQueryProvider` - Wraps with QueryProvider
- `WithQueryProviderAndToaster` - Wraps with QueryProvider and Toaster
- `withChatProviders` - Wraps with chat providers (QueryProvider, ChatOffsetProvider, ChatCacheSyncProvider)
- `withChatProvidersAndToaster` - Wraps with chat providers and Toaster (includes centered layout)
- `withCenteredLayout` - Centers the story
- `withDarkBackground` - Adds dark background

## MSW Handlers

### Using MSW Handler Utilities

Use MSW handler utilities from `#.storybook/lib/msw` for consistent API mocking.

```tsx
import { createSharedChatsHandler } from "#.storybook/lib/msw";

export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [createSharedChatsHandler(50)],
        },
    },
});
```

### Available MSW Handlers

- `createSharedChatsHandler(totalChats?, delay?)` - Handler for GET /api/user-chats/shared
- `createEmptySharedChatsHandler()` - Handler for empty shared chats
- `createFewSharedChatsHandler(count?)` - Handler for few shared chats

## Query Client Management

### Using Query Client Utilities

Use query client utilities from `#.storybook/lib/utils/query-client` for managing query state.

```tsx
import {
    clearAllQueries,
    clearQueriesByTag,
    clearUserSharedChatsQueries,
} from "#.storybook/lib/utils/query-client";

export const Default = meta.story({
    beforeEach: () => {
        clearUserSharedChatsQueries();
    },
});
```

### Available Query Client Utilities

- `clearQueriesByTag(cacheTag)` - Clear queries by cache tag
- `clearUserSharedChatsQueries()` - Clear user shared chats queries
- `clearUserChatsQueries()` - Clear user chats queries
- `clearAllQueries()` - Clear all queries

## Common Patterns

### Dialog Interactions

```tsx
import {
    waitForDialog,
    waitForDialogCloseButton,
    waitForDialogOverlay,
    waitForDialogToClose,
} from "#.storybook/lib/utils/test-helpers";

Default.test("should open and close dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /open dialog/i });
    await userEvent.click(trigger);

    await waitForDialog("dialog");

    const closeButton = await waitForDialogCloseButton();
    await userEvent.click(closeButton);

    await waitForDialogToClose("dialog");
});

Default.test(
    "should close dialog when clicking overlay",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /open dialog/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
        const overlay = await waitForDialogOverlay();
        await userEvent.click(overlay);

        await waitForDialogToClose("dialog");
    },
);
```

### Form Interactions

```tsx
Default.test("should submit form", async ({ canvas, userEvent }) => {
    const emailInput = canvas.getByPlaceholderText(/email/i);
    const passwordInput = canvas.getByRole("textbox", { name: /password/i });
    const submitButton = canvas.getByRole("button", { name: /submit/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    // Assertions...
});
```

### Table Interactions

```tsx
Default.test("should render table with data", async ({ canvas }) => {
    const table = canvas.getByRole("table");
    expect(table).toBeInTheDocument();

    const rows = canvas.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);

    const links = canvas.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
});
```

### Pagination

```tsx
import { waitForText } from "#.storybook/lib/utils/test-helpers";

Default.test("should navigate to next page", async ({ canvas, userEvent }) => {
    const nextButton = canvas.getByRole("button", { name: /go to next page/i });
    await userEvent.click(nextButton);

    await waitForText(canvas, /page 2 of/i);
});
```

### Tooltip Interactions

```tsx
import { waitForTooltip } from "#.storybook/lib/utils/test-helpers";

Default.test("should show tooltip on hover", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");
    await userEvent.hover(button);

    const tooltip = await waitForTooltip();
    expect(tooltip).toBeVisible();
});
```

### Input Placeholder Animation

```tsx
import { getInputPlaceholderText } from "#.storybook/lib/utils/elements";

Default.test(
    "should animate through placeholders",
    async ({ canvas, args }) => {
        const input = canvas.getByRole("textbox");
        expect(input).toBeVisible();

        await waitFor(() => {
            const text = getInputPlaceholderText();
            expect(text).toBe(args.placeholders?.[0]);
        });
    },
);
```

## Best Practices

1. **Always use shared utilities** - Don't duplicate code, use the shared utilities
2. **Consistent test names** - Always use "should [action/state]" format
3. **Use mock factories** - Don't create inline mock data
4. **Use element queries** - Use utility functions instead of direct queries
5. **Use test helpers** - Use wait helpers instead of manual waitFor calls
6. **Use decorators** - Use shared decorators for common setups
7. **Use MSW handlers** - Use handler utilities for consistent API mocking
8. **Clean up in beforeEach/afterEach** - Clear queries and mocks appropriately
9. **One assertion per test** - Or group related assertions logically
10. **Descriptive test names** - Test names should clearly describe what is being tested
11. **Use status constants** - Always use `MOCK_CHAT_STATUS` instead of hardcoded status strings
12. **Use message constants** - Use pre-configured message constants instead of array access like `MOCK_CONVERSATION_WITH_MULTIPLE_FILES[0]`
13. **Use parts constants** - Use filtered parts constants instead of inline filtering
14. **Avoid inline filtering** - Don't filter parts inline, use pre-filtered constants like `MOCK_FILE_PARTS_MULTIPLE`
15. **No raw data in stories** - Never define raw mock data (objects, arrays, constants) directly in story files. All mock data must be defined in `#.storybook/lib/mocks` and imported into stories. This keeps stories clean and makes mock data reusable across multiple stories.

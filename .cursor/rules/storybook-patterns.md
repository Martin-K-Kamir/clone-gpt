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
    createMockUser,
    getButton,
    waitForDialog,
    withQueryProvider,
} from "#.storybook/lib";
import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { MyComponent } from "./my-component";

const meta = preview.meta({
    component: MyComponent,
    decorators: [withQueryProvider],
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

### Using Shared Mocks

Always use shared mock factories from `#.storybook/lib/mocks` instead of creating inline mocks.

```tsx
import {
    createMockUser,
    createMockChat,
    createMockChats,
    createMockUserMessage,
    createMockAssistantMessage,
} from "#.storybook/lib/mocks";

// ✅ Good
const user = createMockUser();
const chat = createMockChat(0);
const chats = createMockChats(10);

// ❌ Bad
const user = {
    id: "123",
    name: "Test User",
    // ...
};
```

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
    withChatProviders,
    withChatProvidersAndToaster,
    withQueryProvider,
    withQueryProviderAndToaster,
} from "#.storybook/lib/decorators";

const meta = preview.meta({
    component: MyComponent,
    decorators: [withQueryProviderAndToaster],
});
```

### Available Decorators

- `withQueryProvider` - Wraps with QueryProvider
- `withQueryProviderAndToaster` - Wraps with QueryProvider and Toaster
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

## Examples

See the refactored stories for examples:

- `src/components/ui/button/button.stories.tsx`
- `src/features/user/components/user-shared-chats-table/user-shared-chats-table.stories.tsx`
- `src/features/auth/components/auth-signin-dialog/auth-signin-dialog.stories.tsx`

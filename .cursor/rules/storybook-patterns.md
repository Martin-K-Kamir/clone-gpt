# Storybook Patterns and Conventions

This document outlines the patterns, conventions, and best practices for writing Storybook stories and tests in this codebase.

## Table of Contents

- [Story Structure](#story-structure)
- [Test Naming](#test-naming)
- [Mock Data](#mock-data)
- [Element Queries](#element-queries)
- [Test Helpers](#test-helpers)
- [Decorators & Providers](#decorators--providers)
- [MSW Handlers](#msw-handlers)
- [Query Client Management](#query-client-management)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)

## Story Structure

### Basic Structure

```tsx
import { AppProviders } from "#.storybook/lib/decorators/providers";
import { createMockUser } from "#.storybook/lib/mocks/users";
import { waitForDialog } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

const mockUser = createMockUser();

const meta = preview.meta({
    component: MyComponent,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
        ),
    ],
    parameters: {
        provider: { user: mockUser },
        a11y: { test: "error" },
    },
});

export const Default = meta.story({
    args: { onClick: fn() },
});

Default.test("should render component", async ({ canvas }) => {
    expect(canvas.getByRole("button")).toBeInTheDocument();
});
```

### Story Naming Conventions

- **Default** - Base/default story
- **WithXxx** - Adds features/data (`WithDescription`, `WithAction`, `WithGroups`)
- **WithoutXxx** - Removes features (`WithoutFileButton`, `WithoutCancelButton`)
- **SizeXxx** - Size variations (`SizeXs`, `SizeSm`, `SizeLg`)
- **SideXxx** - Positioning (`SideRight`, `SideLeft`, `SideTop`, `SideBottom`)
- **State names** - `Loading`, `Disabled`, `Error`, `Empty`
- **Variants** - `Destructive`, `Outline`, `Secondary`
- **CustomXxx** - Custom configurations (`CustomDuration`, `CustomWidth`)
- **InDialogXxx** - Dialog-specific stories (`InDialogDefault`, `InDialogWithItems`)

## Test Naming

**Format**: Always use `"should [action/state]"`

✅ **Good**: `"should render component"`, `"should open dialog when button is clicked"`  
❌ **Bad**: `"renders component"`, `"opens dialog"`, `"test button click"`

## Mock Data

### Critical Rules

**CRITICAL**: All mock data must be **stable and fixed** (no random values) for visual regression testing.

- ✅ Use fixed constants: `FIXED_DATE`, `MOCK_USER_ID`, `MOCK_CHAT_ID`, `MOCK_CHAT_STATUS.READY`
- ✅ Use mock factories from `#.storybook/lib/mocks`
- ❌ Never use `Math.random()`, `Date.now()`, `crypto.randomUUID()`
- ❌ Never define raw data in story files - all mocks must be in `#.storybook/lib/mocks`

```tsx
// ✅ Good
import { FIXED_DATE, MOCK_CHAT_ID, createMockChat, MOCK_CHAT_STATUS } from "#.storybook/lib/mocks";
const chat = createMockChat(0);
const status = MOCK_CHAT_STATUS.READY;

// ❌ Bad
const chatId = crypto.randomUUID();
const date = new Date().toISOString();
const status = "ready" as ChatStatus;
const mockData = [{ id: "123", name: "Test" }]; // Raw data in story
```

### Available Mock Factories

**Users**: `createMockUser()`, `createMockUsers(count)`, `createMockGuestUser()`, `createMockAdminUser()`

**Chats**: `createMockChat(index)`, `createMockChats(count)`, `createMockPaginatedChats(length, hasNextPage?)`, `createMockPrivateChat(index)`, `createMockPublicChat(index)`, `createMockChatWithOwner(chatId?, isOwner?)`

**Messages**: `createMockUserMessage(text)`, `createMockAssistantMessage(text)`, `createMockUserMessageWithFiles(text, files)`, `createMockMessages(count)`, `createMockTextMessagePart(text)`, `createMockFileMessagePart(options?)`, `createMockImageMessagePart(options?)`

**Pre-configured Constants**: `MOCK_USER_MESSAGE_WITH_SINGLE_FILE`, `MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES`, `MOCK_FILE_PARTS_MULTIPLE`, `MOCK_SOURCE_PARTS`, `MOCK_SOURCE_PREVIEWS`, etc.

**Files**: `createColoredImageFile(color, filename)`, `createTextFile(content, filename?)`, `createPDFFile(filename?)`

## Element Queries

**Rule**: Only create utilities for elements requiring `document.querySelector`. Use canvas methods directly for simple queries.

```tsx
import {
    getDialog,
    getInputPlaceholderText,
    getTooltip,
} from "#.storybook/lib/utils/elements";

// ✅ Good - document.querySelector needed
const dialog = getDialog("dialog");
const tooltip = getTooltip();

// ✅ Good - direct canvas methods
const button = canvas.getByRole("button", { name: /submit/i });
```

**Available**: `getDialog(role?)`, `getDialogOverlay()`, `getDialogCloseButton()`, `getTooltip()`, `getInputPlaceholderText()`, `getDropdownMenu()`

## Test Helpers

**IMPORTANT**: Always use test helpers from `#.storybook/lib/utils/test-helpers` instead of `document.querySelector` or manual `waitFor`.

```tsx
import {
    waitForDialog,
    waitForDialogToClose,
    waitForTooltip,
} from "#.storybook/lib/utils/test-helpers";

// ✅ Good
await waitForDialog("dialog");
await waitForDialogToClose("dialog");

// ❌ Bad
await waitFor(() => {
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
});
```

**Available**: `waitForDialog()`, `waitForDialogToClose()`, `waitForTooltip()`, `waitForElement()`, `waitForText()`, `clickAndWait()`, `typeAndWait()`, `findButtonByText()`

## Decorators & Providers

### Provider Pattern

**CRITICAL**: Use `parameters.provider` to customize provider props. Don't re-define decorators in stories (causes duplicate nesting).

```tsx
const meta = preview.meta({
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
});

// ✅ Good - Use parameters.provider
export const WithFiles = meta.story({
    parameters: {
        provider: { selectedFiles: MOCK_FILES_MIXED },
    },
});

// ❌ Bad - Re-defining decorator
export const WithFiles = meta.story({
    decorators: [
        Story => <AppProviders selectedFiles={MOCK_FILES_MIXED}><Story /></AppProviders>
    ],
});
```

### Available Providers

- **`AppProviders`** - Unified provider (always includes `ChatProvider`, `ChatSidebarProvider`, and all context providers with safe defaults)
    - Props: `status?`, `selectedFiles?`, `rateLimit?` (alias for `rateLimitMessages`), `rateLimitFiles?`, `user?`, `messages?`, `chatId?`, etc.
- **`QueryProvider`** - Basic React Query provider
- **`UserSessionProvider`** - User session provider

**Key Points**:

- Styling wrappers stay in story files, not providers
- Pass `user` via `parameters.provider.user`, not setter components
- Always spread `parameters.provider` directly: `<AppProviders {...parameters.provider}>`

## MSW Handlers

**IMPORTANT**: Always use handler utilities from `#.storybook/lib/msw/handlers` instead of inline handlers.

```tsx
import {
    createResourcePreviewsHandler,
    createUserChatsHandler,
    createUserChatsSearchHandler,
} from "#.storybook/lib/msw/handlers";

// ✅ Good
export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserChatsHandler({ length: 10 }),
                createUserChatsSearchHandler({ resultsPerQuery: 5 }),
            ],
        },
    },
});

// ❌ Bad - Inline handlers
handlers: [
    http.post("/api/resource-previews", async () => {
        return HttpResponse.json(MOCK_SOURCE_PREVIEWS);
    }),
],
```

### Available Handlers

**Resource Previews** (`POST /api/resource-previews`):

- `createResourcePreviewsHandler(options?)` - Options: `previews?`, `delay?` (number or `"infinite"`)
- `createSingleResourcePreviewsHandler()`, `createManyResourcePreviewsHandler()`
- `createLoadingResourcePreviewsHandler()`, `createErrorResourcePreviewsHandler()`, `createEmptyResourcePreviewsHandler()`

**User Chats** (`GET /api/user-chats`):

- `createUserChatsHandler(options?)` - Simple handler, Options: `length?`, `visibility?`, `delay?`
- `createUserChatsPaginatedHandler(options?)` - Paginated with `hasNextPage`, Options: `length?`, `hasNextPage?`, `visibility?`, `delay?`
- `createPaginatedUserChatsHandler(options?)` - Handles offset/limit, Options: `pageLength?`, `hasNextPage?`, `visibility?`, `delay?`
- `createInfiniteScrollUserChatsHandler(options?)` - Infinite scroll, Options: `initialItems?`, `additionalPages?`, `limit?`, `visibility?`, `delay?`
- `createEmptyUserChatsHandler()`, `createErrorUserChatsHandler(message?)`

**User Chats Search** (`GET /api/user-chats/search`):

- `createUserChatsSearchHandler(options?)` - Options: `resultsPerQuery?`, `visibility?`, `emptyQueries?`, `delay?`
- `createPaginatedUserChatsSearchHandler(options?)` - Cursor-based pagination, Options: `maxPages?`, `resultsPerPage?`, `daysPerPage?`, `visibility?`, `emptyQueries?`, `delay?`

**Shared Chats** (`GET /api/user-chats/shared`):

- `createSharedChatsHandler(options?)` - Options: `chats?`, `hasNextPage?`, `delay?`

## Query Client Management

**IMPORTANT**: Always use utilities from `#.storybook/lib/utils/query-client` instead of importing from application code.

```tsx
import { clearAllQueries } from "#.storybook/lib/utils/query-client";

export const Default = meta.story({
    afterEach: () => {
        clearAllQueries();
    },
});
```

**Available**: `clearAllQueries()`, `clearQueriesByTag(cacheTag)`, `clearUserSharedChatsQueries()`, `clearUserChatsQueries()`

## Common Patterns

### Dialog Interactions

```tsx
import {
    waitForDialog,
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
```

### Form Interactions

```tsx
Default.test("should submit form", async ({ canvas, userEvent }) => {
    const emailInput = canvas.getByPlaceholderText(/email/i);
    const submitButton = canvas.getByRole("button", { name: /submit/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitButton);
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

## Best Practices

1. **Always use shared utilities** - Don't duplicate code
2. **Consistent test names** - Always use `"should [action/state]"` format
3. **Use mock factories** - Don't create inline mock data
4. **Use element queries** - Use utilities instead of direct `document.querySelector`
5. **Use test helpers** - Use wait helpers instead of manual `waitFor` calls
6. **Use MSW handlers** - Use handler utilities for consistent API mocking
7. **Clean up in afterEach** - Clear queries and mocks appropriately
8. **Use status constants** - Always use `MOCK_CHAT_STATUS.READY` instead of hardcoded strings
9. **Use message constants** - Use pre-configured constants instead of array access
10. **No raw data in stories** - All mock data must be in `#.storybook/lib/mocks`
11. **No helper functions in stories** - Move helpers to mocks files
12. **Use provider props** - Pass props via `parameters.provider`, not setter components
13. **Direct spread parameters.provider** - Always spread directly: `<AppProviders {...parameters.provider}>`
14. **Use rateLimit alias** - `rateLimit` is an alias for `rateLimitMessages` in `AppProviders`
15. **Unified provider** - `AppProviders` always includes all necessary providers with safe defaults
16. **Use Storybook utilities** - Always use Storybook-specific utilities, not application code imports

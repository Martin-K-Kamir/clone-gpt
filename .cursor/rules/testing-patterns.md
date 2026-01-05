# Testing Patterns

## Overview

This project uses **Vitest** for unit and integration testing, **@testing-library/react** for React component testing, and **MSW** for API mocking. All tests should follow these patterns and best practices.

## Running Tests After Updates

**CRITICAL**: After making any code changes, always run the relevant tests to ensure nothing is broken.

### When to Run Tests

Run tests after:

- ✅ Adding new features or functionality
- ✅ Modifying existing code
- ✅ Refactoring code
- ✅ Fixing bugs
- ✅ Updating dependencies
- ✅ Changing API contracts or data structures

### How to Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run specific test project
npm run test:unit          # Unit tests only
npm run test:react         # React component tests only
npm run test:integration   # Integration tests only

# Run tests with coverage
npm run test:coverage

# Run tests for a specific file
npm test path/to/file.test.ts
```

### Test Scope

- **Unit tests** (`*.test.ts`): Run when modifying utilities, services, or business logic
- **Integration tests** (`*.spec.ts`): Run when modifying database operations, API routes, or complex workflows
- **React tests** (`*.test.tsx`): Run when modifying components or hooks
- **Storybook tests**: Run when modifying UI components or stories

### Best Practice

1. **Before committing**: Run `npm test` to ensure all tests pass
2. **During development**: Use `npm run test:watch` to get immediate feedback
3. **Before PR**: Run full test suite including coverage: `npm run test:coverage`
4. **After refactoring**: Run all test types to catch regressions

**Note**: If tests fail after your changes, either fix the code or update the tests if the behavior change is intentional.

## Test Naming Conventions

### Test Names Must Start with "should"

All test names must start with "should" to clearly describe the expected behavior:

```typescript
// ✅ Good
it("should return query result from useQuery", () => {
    // ...
});

it("should call onLimitExceeded when data indicates limit exceeded", () => {
    // ...
});

it("should not call callbacks when data is undefined", () => {
    // ...
});

// ❌ Bad
it("returns query result from useQuery", () => {
    // ...
});

it("calls onLimitExceeded", () => {
    // ...
});
```

### Descriptive Test Names

Test names should clearly describe:

- **What** the code should do
- **When** or **under what conditions**
- **Expected outcome**

```typescript
// ✅ Good - Clear and descriptive
it("should update chat title when user is owner", () => {
    // ...
});

it("should return error when user is not authorized", () => {
    // ...
});

it("should truncate title longer than 25 characters", () => {
    // ...
});

// ❌ Bad - Vague
it("should work", () => {
    // ...
});

it("should handle edge case", () => {
    // ...
});
```

## Test Structure

### File Organization

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.spec.ts` or `*.spec.tsx`
- Place test files next to the code they test

```
src/features/chat/services/db/
├── get-user-chat-by-id.ts
├── get-user-chat-by-id.test.ts    # Unit tests
└── get-user-chat-by-id.spec.ts    # Integration tests
```

### Test Structure

```typescript
import { describe, expect, it, vi } from "vitest";

import { functionToTest } from "./function-to-test";

describe("functionToTest", () => {
    // Setup (beforeEach, afterEach, etc.)

    describe("specific behavior", () => {
        it("should do something specific", () => {
            // Arrange
            const input = "test";

            // Act
            const result = functionToTest(input);

            // Assert
            expect(result).toBe("expected");
        });
    });
});
```

## Best Practices

### 1. Don't Test Implementation Details

Focus on **behavior** and **outcomes**, not internal implementation:

```typescript
// ✅ Good - Tests behavior
it("should return user data when authenticated", async () => {
    const user = await getUser(userId);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
});

// ❌ Bad - Tests implementation
it("should call fetch with correct URL", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    getUser(userId);
    expect(fetchSpy).toHaveBeenCalledWith("/api/user");
});
```

### 2. Avoid Dynamic Imports

Never use `vi.importActual` or dynamic `await import()` in tests:

```typescript
// ✅ Good - Static imports
import { someFunction } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
    someFunction: vi.fn(),
}));

// ❌ Bad - Dynamic imports
const { someFunction } = await vi.importActual("@/lib/utils");
```

### 3. Use Constants and Types from Libs

Always use constants and types from feature libs instead of hardcoded values:

```typescript
// ✅ Good
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { USER_ROLE } from "@/features/user/lib/constants";
import { CHAT_ROLE } from "@/features/chat/lib/constants";
import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

const chat = {
    visibility: CHAT_VISIBILITY.PRIVATE,
    // ...
};

const user = {
    role: USER_ROLE.USER,
    // ...
};

const message = {
    role: CHAT_ROLE.ASSISTANT,
    // ...
};

// ❌ Bad
const chat = {
    visibility: "private",  // Hardcoded string
    // ...
};

const user = {
    role: "user",  // Hardcoded string
    // ...
};
```

### 4. Use Test Helpers

Use helpers from `@/vitest/helpers/generate-test-ids.ts` for generating test data:

```typescript
// ✅ Good
import {
    generateUserId,
    generateChatId,
    generateMessageId,
    generateUserEmail,
} from "@/vitest/helpers/generate-test-ids";

const userId = generateUserId();
const chatId = generateChatId();
const messageId = generateMessageId();

// ❌ Bad
const userId = "user-123";  // Hardcoded ID
const chatId = "chat-abc";  // Hardcoded ID
```

**Note**: For integration tests (`.spec.ts`), use seeded IDs from the test database setup instead of generated IDs to avoid foreign key constraint violations.

### 5. Avoid Unnecessary Type Assertions

Minimize `as any` type assertions. Use proper types and type guards:

```typescript
// ✅ Good
const userId = generateUserId();  // Properly typed
const chat = await getChat(chatId);
if (chat) {
    expect(chat.isOwner).toBe(true);
}

// ✅ Good - Type guard
if (chat && "isOwner" in chat) {
    expect(chat.isOwner).toBe(true);
}

// ❌ Bad - Unnecessary type assertion
const userId = "user-123" as any;
const chat = await getChat(chatId) as any;
```

**Exception**: `as any` is acceptable when mocking browser APIs in tests:

```typescript
// ✅ Acceptable - Mocking browser API
global.navigator = {
    geolocation: {
        getCurrentPosition: vi.fn(),
    },
} as any;
```

### 6. Keep Tests Readable and Focused

Each test should:

- Test **one thing**
- Be **self-contained** and **independent**
- Have **clear setup** and **teardown**
- Use **descriptive variable names**

```typescript
// ✅ Good - Clear and focused
it("should update chat visibility to public", async () => {
    const userId = generateUserId();
    const chatId = generateChatId();

    await createChat({ userId, chatId, visibility: CHAT_VISIBILITY.PRIVATE });

    const result = await updateChatVisibility({
        chatId,
        userId,
        visibility: CHAT_VISIBILITY.PUBLIC,
    });

    expect(result.success).toBe(true);
    const updatedChat = await getChatById(chatId);
    expect(updatedChat?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
});

// ❌ Bad - Too complex, tests multiple things
it("should handle chat operations", async () => {
    // Creates chat, updates visibility, deletes messages, etc.
    // Too many assertions, unclear what's being tested
});
```

### 7. Don't Intentionally Slow Down Tests

- Use `vi.useFakeTimers()` for time-dependent tests
- Mock external dependencies
- Avoid real network calls in unit tests
- Use fast, in-memory test data when possible

```typescript
// ✅ Good - Fast, mocked
beforeEach(() => {
    vi.useFakeTimers();
    vi.mock("@/lib/api", () => ({
        fetchData: vi.fn().mockResolvedValue({ data: "test" }),
    }));
});

// ❌ Bad - Slow, real network calls
it("should fetch data", async () => {
    const data = await fetch("https://api.example.com/data");
    // Real network call in test
});
```

### 8. Proper Mock Setup

```typescript
// ✅ Good - Proper mock setup
vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

const auth = vi.mocked(await import("@/features/auth/services/auth")).auth;

auth.mockResolvedValue({
    user: { id: generateUserId() },
});

// ❌ Bad - Using as any
(auth as any).mockResolvedValue({
    user: { id: "user-123" },
});
```

## Test Categories

### Unit Tests (`*.test.ts`)

Test individual functions, utilities, or components in isolation:

```typescript
describe("getUserChats", () => {
    it("should return user chats with correct structure", () => {
        const userId = generateUserId();
        const result = getUserChats(userId);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
    });
});
```

### Integration Tests (`*.spec.ts`)

Test interactions between multiple components, services, or database operations:

```typescript
describe("createUserChat integration", () => {
    it("should create chat and return with correct visibility", async () => {
        const userId = "00000000-0000-0000-0000-000000000001"; // Seeded ID
        const chatId = generateChatId();

        const chat = await createUserChat({
            userId,
            chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(chat).toBeDefined();
        expect(chat?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});
```

**Note**: Integration tests should use seeded database IDs that exist in the test database setup.

## React Component Testing

### Using Testing Library

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MyComponent } from "./my-component";

describe("MyComponent", () => {
    it("should render with correct text", () => {
        render(<MyComponent title="Test" />);

        expect(screen.getByText("Test")).toBeInTheDocument();
    });
});
```

### Testing Hooks

```typescript
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMyHook } from "./use-my-hook";

describe("useMyHook", () => {
    it("should return initial value", () => {
        const { result } = renderHook(() => useMyHook());

        expect(result.current.value).toBeDefined();
    });
});
```

## Mocking Patterns

### Mocking Modules

```typescript
// Mock at the top level
vi.mock("@/lib/utils", () => ({
    someFunction: vi.fn(),
    anotherFunction: vi.fn(() => "mocked"),
}));
```

### Mocking Functions

```typescript
const mockFunction = vi.fn();
mockFunction.mockResolvedValue({ data: "test" });
mockFunction.mockRejectedValue(new Error("Failed"));
```

### Mocking React Query

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);
```

## Common Patterns

### Testing Async Operations

```typescript
it("should handle async operation", async () => {
    const result = await asyncFunction();

    expect(result).toBeDefined();
    await expect(asyncFunction()).resolves.toBeDefined();
    await expect(failingFunction()).rejects.toThrow();
});
```

### Testing Error Cases

```typescript
it("should throw error when input is invalid", () => {
    expect(() => {
        validateInput(null);
    }).toThrow("Invalid input");

    expect(() => {
        validateInput(null);
    }).toThrow(AssertError);
});
```

### Testing with Timers

```typescript
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it("should debounce function calls", async () => {
    const debouncedFn = vi.fn();

    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(500);

    expect(debouncedFn).toHaveBeenCalledTimes(2);
});
```

## Test Helpers Location

Test helpers are located in `src/vitest/helpers/`:

- `generate-test-ids.ts` - ID generation helpers (`generateUserId`, `generateChatId`, `generateMessageId`, `generateUserEmail`)
- `create-mock-session.ts` - Session mocking helpers
- Additional helpers as needed

## Checklist

Before submitting tests, ensure:

- [ ] All test names start with "should"
- [ ] Tests focus on behavior, not implementation
- [ ] No dynamic imports (`vi.importActual`, `await import`)
- [ ] Constants used from feature libs (not hardcoded strings)
- [ ] Test helpers used for generating test data
- [ ] No unnecessary `as any` type assertions
- [ ] Tests are readable and focused on one thing
- [ ] Tests are fast (no real network calls, proper mocking)
- [ ] Proper cleanup in `afterEach` hooks
- [ ] Integration tests use seeded database IDs
- [ ] Unit tests use generated IDs from helpers

## Examples

### Good Test Example

```typescript
import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { updateChatVisibility } from "./update-chat-visibility";

describe("updateChatVisibility", () => {
    it("should update visibility to public when user is owner", async () => {
        const userId = generateUserId();
        const chatId = generateChatId();

        await createChat({
            userId,
            chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        const result = await updateChatVisibility({
            chatId,
            userId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result.success).toBe(true);
        const updatedChat = await getChatById(chatId);
        expect(updatedChat?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should return error when user is not owner", async () => {
        const ownerId = generateUserId();
        const otherUserId = generateUserId();
        const chatId = generateChatId();

        await createChat({
            userId: ownerId,
            chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        const result = await updateChatVisibility({
            chatId,
            userId: otherUserId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });
});
```

### Bad Test Example

```typescript
// ❌ Bad - Multiple issues
describe("updateChatVisibility", () => {
    it("updates visibility", async () => {
        // Missing "should"
        const userId = "user-123"; // Hardcoded ID
        const chatId = "chat-abc"; // Hardcoded ID

        await createChat({
            userId,
            chatId,
            visibility: "private", // Hardcoded constant
        });

        const result = await updateChatVisibility({
            chatId,
            userId,
            visibility: "public", // Hardcoded constant
        });

        // Tests implementation details
        expect(result).toHaveProperty("success");
        expect(result.success).toBe(true);
    });
});
```

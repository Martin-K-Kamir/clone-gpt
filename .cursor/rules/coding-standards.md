# Coding Standards

## TypeScript

### Strict Mode

TypeScript strict mode is enabled. Follow these rules:

- ✅ Always use explicit types for function parameters and return types
- ✅ Avoid `any` - use `unknown` if type is truly unknown
- ✅ Use type assertions sparingly and with good reason
- ✅ Prefer type guards over type assertions
- ✅ Use `as const` for literal types and readonly arrays

### Type Definitions

- Place shared types in `src/lib/types/`
- Feature-specific types go in `features/[feature]/lib/types/`
- Use descriptive type names prefixed with domain:
    - `DBUserId` for database user IDs
    - `UIChatMessage` for UI chat message format
    - `ChatRequestBody` for API request bodies

### Naming Conventions

- **Files**: kebab-case (e.g., `user-service.ts`, `chat-message.tsx`)
- **Components**: PascalCase (e.g., `ChatMessage`, `UserProfile`)
- **Functions**: camelCase (e.g., `getUserById`, `createChatMessage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `ChatMessage`)
- **Generic Types**: Hungarian Notation (e.g., `TString`, `TDelimiters`, `TUser`)

## Import Organization

Follow this import order:

1. External dependencies (React, Next.js, third-party)
2. Internal absolute imports (`@/...`)
3. Relative imports (`./`, `../`)

Separate groups with blank lines:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { getUserById } from "@/features/user/services/db";

import { formatDate } from "./utils";
```

Use the `@trivago/prettier-plugin-sort-imports` plugin configuration for consistent sorting.

## Code Style

### Formatting

- Use **4 spaces** for indentation (configured in Prettier)
- Use **semicolons** (automatic via Prettier)
- Use **double quotes** for strings (configured in Prettier)
- Trailing commas in multi-line structures

### React Components

```typescript
// ✅ Good - Server Component (default)
export function UserProfile({ userId }: { userId: string }) {
  // ...
}

// ✅ Good - Client Component
"use client";

import { useState } from "react";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  // ...
}

// ✅ Good - Props interface
type UserProfileProps = {
  userId: string;
  showEmail?: boolean;
};

export function UserProfile({ userId, showEmail = false }: UserProfileProps) {
  // ...
}
```

### Async/Await

Prefer async/await over promises:

```typescript
// ✅ Good
async function fetchUser() {
  const user = await getUserById("123");
  return user;
}

// ❌ Avoid
function fetchUser() {
  return getUserById("123").then(user => user);
}
```

### Error Handling

- Use custom error classes from `src/lib/classes/`
- Handle errors at the API route level
- Use `handleApiErrorResponse` utility for consistent error responses
- Always log errors with context

```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error("[feature] operation failed:", error);
  return handleApiErrorResponse(error);
}
```

### Console Logging

Use prefixed console logs for debugging:

```typescript
console.log("[chat] message received:", message);
console.error("[auth] login failed:", error);
console.warn("[user] rate limit approaching:", count);
```

The prefix should match the feature/context where the log occurs.

## Constants

### Organization

- Shared constants: `src/lib/constants/`
- Feature constants: `features/[feature]/lib/constants/`
- Use `as const` for type safety:

```typescript
export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
    GUEST: "guest",
} as const;
```

### Enum-like Objects

Prefer const objects over TypeScript enums:

```typescript
// ✅ Good
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

// ❌ Avoid
export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
```

## Assertions

Use assertion functions from feature libs:

```typescript
import { assertSessionExists } from "@/features/auth/lib/asserts";

// ✅ Good
assertSessionExists(session);
// TypeScript now knows session is not null

// ❌ Bad
if (!session) throw new Error("Session required");
```

## Validation

Use Zod schemas for runtime validation:

- Place schemas in `src/lib/schemas/` or `features/[feature]/lib/schemas/`
- Validate API request bodies
- Validate user input in forms

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

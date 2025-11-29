# API Route Patterns

## Route File Structure

API routes live in `src/app/*/api/[route-name]/route.ts`:

```
src/app/
├── (auth)/api/auth/route.ts
├── (chat)/api/chat/route.ts
└── (user)/api/user/route.ts
```

## Route Handlers

Export named functions for HTTP methods:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Handle GET request
}

export async function POST(request: NextRequest) {
    // Handle POST request
}
```

## Request Validation

Always validate request bodies with Zod schemas:

```typescript
import { z } from "zod";

const requestSchema = z.object({
    email: z.string().email(),
    message: z.string().min(1),
});

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Validate
    const result = requestSchema.safeParse(body);
    if (!result.success) {
        return api.badRequest("Invalid request body", result.error);
    }

    const { email, message } = result.data;
    // ...
}
```

Use assertion functions for validation when available:

```typescript
import { assertIsChatRequestBodyValid } from "@/features/chat/lib/asserts";

export async function POST(request: NextRequest) {
    const body = await request.json();
    assertIsChatRequestBodyValid(body);
    // TypeScript now knows body is valid
}
```

## Authentication

Always check authentication:

```typescript
import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    assertSessionExists(session);

    // Now you can safely access session.user.id
    const userId = session.user.id;
}
```

Use Promise.all for parallel operations:

```typescript
const [requestBody, session] = await Promise.all([request.json(), auth()]);
```

## Response Patterns

Use the API response utilities from `@/lib/api-response`:

```typescript
import { api } from "@/lib/api-response";

// Success responses
return api.ok(data);
return api.created(data);
return api.noContent();

// Error responses
return api.badRequest(message, details);
return api.unauthorized(message);
return api.forbidden(message);
return api.notFound(message);
return api.internalServerError(message, error);
```

## Error Handling

Always wrap route handlers in try-catch:

```typescript
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export async function POST(request: NextRequest) {
    try {
        // Route logic
        return api.ok(result);
    } catch (error) {
        console.error("[route-name] error:", error);
        return handleApiErrorResponse(error);
    }
}
```

## Logging

Use prefixed console logs for debugging:

```typescript
console.log("[chat] request body:", requestBody);
console.log("[chat] session:", session);
console.error("[chat] rate limit error:", rateLimitError);
```

The prefix should match the route/feature name.

## Database Access

- Use feature-specific database services from `features/[feature]/services/db`
- Don't access Supabase directly in route handlers
- Always handle errors and null cases

```typescript
import { getUserChatById } from "@/features/chat/services/db";

const chat = await getUserChatById(chatId, userId);
if (!chat) {
  return api.notFound("Chat not found");
}
```

## Type Safety

Use feature-specific types:

```typescript
import type {
    DBChatId,
    DBUserId,
    UIChatMessage,
} from "@/features/chat/lib/types";

function createChatMessage(
    chatId: DBChatId,
    userId: DBUserId,
    message: UIChatMessage,
) {
    // ...
}
```

## Common Patterns

### Pagination

```typescript
const searchParams = request.nextUrl.searchParams;
const page = Number(searchParams.get("page")) || 1;
const limit = Number(searchParams.get("limit")) || 10;

const { data, total } = await getPaginatedData({ page, limit });
```

### Query Parameters

```typescript
import { parseQueryParams } from "@/lib/utils/parse-query-params";

const { page, limit, search } = parseQueryParams(request, {
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
});
```

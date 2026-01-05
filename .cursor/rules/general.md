# General Development Guidelines

## Code Quality

### Readability

- Write self-documenting code with clear variable names
- Add comments for complex business logic, not obvious code
- Break down complex functions into smaller, focused functions
- Use early returns to reduce nesting

### Performance

- Use Server Components by default (better performance)
- Only use Client Components when necessary
- Leverage Next.js caching strategies
- Optimize database queries (avoid N+1 problems)
- Use React.memo for expensive re-renders (client components only)

### Development principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Single Responsibility Principle, Open/Closed Principle, Liskov Substitution Principle, Interface Segregation Principle, Dependency Inversion Principle
- **GRASP**: General Responsibility Assignment Software Patterns
- **FAIL FAST**: If an unexpected invalid condition occurs, throw an error immediately instead of silently ignoring it or trying to recover, unless Defensive Programming considerations suggest handling it more gracefully.
- **DEFENSIVE PROGRAMMING**: Write code that protects itself against invalid input and unexpected conditions.

### Security

- Always validate and sanitize user input
- Use parameterized queries for database operations
- Never expose sensitive data to the client
- Use environment variables for secrets (never commit)
- Check authentication and authorization at API routes

## Git Workflow

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation changes
- `test/description` - Test additions/changes

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Be specific about what changed

Examples:

- ✅ `Add user authentication with NextAuth`
- ✅ `Fix chat message rendering issue`
- ❌ `Update code`
- ❌ `Fix bug`

## Dependencies

### Adding Dependencies

- Check if a similar utility already exists in the codebase
- Prefer well-maintained, popular packages
- Consider bundle size impact
- Check license compatibility

## Environment Variables

- Use `.env.local` for local development (gitignored)
- Document required environment variables
- Use descriptive names with prefixes:
    - `NEXT_PUBLIC_*` for client-accessible variables
    - No prefix for server-only variables
    - Feature prefixes when appropriate: `AUTH_*`, `CHAT_*`

## Documentation

### Code Comments

- Explain "why", not "what"
- Document complex algorithms or business logic
- Add JSDoc comments for public APIs

```typescript
/**
 * Generates a unique chat title from the first user message.
 * Falls back to "New Chat" if message is empty.
 *
 * @param message - The first message in the chat
 * @returns A chat title string
 */
export function generateChatTitle(message: string): string {
    // ...
}
```

### README Files

- Keep README.md updated with setup instructions
- Document environment variables
- Include common development tasks

## Error Handling

### Error Types

Use custom error classes when appropriate:

```typescript
import { ApiError } from "@/lib/classes/api-error";
import { RateLimitError } from "@/lib/classes/rate-limit-error";

throw new ApiError("Invalid request", 400);
throw new RateLimitError("Too many requests");
```

### Error Logging

- Always log errors with context
- Use structured logging when possible
- Include relevant request/context data

```typescript
console.error("[feature] operation failed:", {
    error,
    userId,
    chatId,
    timestamp: new Date().toISOString(),
});
```

## Testing Considerations

When writing code, consider:

- Is this code testable?
- Are there edge cases to handle?
- Are null/undefined cases handled?
- Are error cases handled gracefully?

## Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation works
- Include ARIA labels where appropriate
- Test with screen readers when possible
- Maintain color contrast ratios
- Radix UI components handle accessibility - prefer them

## Code Review Checklist

Before submitting code:

- [ ] TypeScript types are correct
- [ ] No console.logs left in production code (or remove before merge)
- [ ] Error handling is in place
- [ ] Authentication/authorization checked
- [ ] Environment variables documented
- [ ] No hardcoded values
- [ ] Code follows project patterns
- [ ] Components are properly typed
- [ ] API routes validate input
- [ ] Database queries are safe (no SQL injection)
- [ ] **Tests pass** - Run `npm test` and ensure all tests pass
- [ ] **New tests added** - If adding new features, add corresponding tests

## Common Patterns to Follow

### Null Checks

```typescript
// ✅ Good
if (!user) {
  return api.notFound("User not found");
}

// ✅ Good - with assertion
assertUserExists(user);
// TypeScript knows user is not null

// ❌ Bad
const name = user.name; // Could throw if user is null
```

### Optional Chaining

```typescript
// ✅ Good
const email = user?.profile?.email;

// ❌ Avoid when you should handle the case
const email = user?.profile?.email ?? "No email";
```

### Array Operations

```typescript
// ✅ Good - filter then map
const activeUsers = users.filter(user => user.isActive).map(user => user.name);

// ✅ Good - use find for single items
const user = users.find(u => u.id === userId);
```

### Async Operations

```typescript
// ✅ Good - parallel operations
const [user, settings] = await Promise.all([
  getUserById(userId),
  getSettings(userId),
]);

// ✅ Good - sequential with dependency
const user = await getUserById(userId);
const chats = await getUserChats(user.id);
```

## Development Tools

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Code formatting (auto-format on save recommended)
- **TypeScript**: Strict mode enabled
- **Turbopack**: Used for faster dev builds (`--turbopack` flag)

## Testing Workflow

**IMPORTANT**: Always run tests after making code changes to ensure nothing is broken.

### After Making Changes

1. **Run relevant tests**: Use `npm test` or `npm run test:watch` during development
2. **Check test results**: Ensure all tests pass before committing
3. **Add tests for new features**: Write tests for new functionality
4. **Update tests if behavior changes**: If you intentionally change behavior, update corresponding tests

### Test Commands

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode (recommended)
npm run test:unit           # Unit tests only
npm run test:react          # React tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # With coverage report
```

See [testing-patterns.md](./testing-patterns.md) for detailed testing guidelines.

## Best Practices Summary

1. **Type Safety**: Use TypeScript strictly, avoid `any`
2. **Server First**: Prefer Server Components, use Client Components only when needed
3. **Feature Isolation**: Keep features self-contained
4. **Shared Utilities**: Extract truly shared code to `src/lib/`
5. **Validation**: Always validate input at API boundaries
6. **Error Handling**: Handle errors gracefully with proper logging
7. **Performance**: Optimize for both server and client performance
8. **Accessibility**: Build accessible UIs from the start
9. **Security**: Never trust client input, always validate and authenticate
10. **Testing**: Always run tests after making changes and ensure they pass

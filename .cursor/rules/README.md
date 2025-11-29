# Cursor Agent Rules

This directory contains rule files that guide AI agents when working on this codebase.

## Rule Files

### [architecture.md](./architecture.md)

Overall project architecture, directory structure, and organizational patterns. Covers:

- Next.js App Router structure
- Feature-based architecture
- Path aliases and route groups
- Server vs Client Components

### [coding-standards.md](./coding-standards.md)

Coding conventions and TypeScript best practices. Covers:

- TypeScript strict mode guidelines
- Naming conventions
- Import organization
- Code style and formatting
- Error handling patterns

### [component-patterns.md](./component-patterns.md)

React component patterns and UI component guidelines. Covers:

- Component file structure
- Variant patterns with CVA
- Server vs Client Components
- Component composition
- Accessibility guidelines

### [api-patterns.md](./api-patterns.md)

API route patterns and best practices. Covers:

- Route handler structure
- Request validation
- Authentication patterns
- Response utilities
- Error handling
- Streaming responses

### [server-actions.md](./server-actions.md)

Server Actions patterns and best practices. Covers:

- Creating server actions
- Authentication and authorization
- Input validation
- Response patterns
- Error handling
- File uploads and batch operations
- Optimistic updates
- When to use server actions vs API routes

### [feature-structure.md](./feature-structure.md)

Feature-based architecture guidelines. Covers:

- Feature organization
- Feature isolation principles
- Services layer patterns
- Type organization
- Constants and assertions

### [general.md](./general.md)

General development guidelines and best practices. Covers:

- Code quality standards
- Git workflow
- Dependencies management
- Documentation
- Error handling
- Accessibility

## How to Use

These rules are automatically used by Cursor's AI agents to:

- Follow project conventions
- Maintain code consistency
- Understand project structure
- Apply best practices

When working on the codebase, agents will reference these rules to ensure code matches the project's patterns and standards.

## Updating Rules

When updating these rules:

1. Keep them accurate to current codebase patterns
2. Update examples to match actual code
3. Document new patterns as they emerge
4. Remove outdated practices

## Quick Reference

**Need to know:**

- File structure? → [architecture.md](./architecture.md)
- How to write a component? → [component-patterns.md](./component-patterns.md)
- API route conventions? → [api-patterns.md](./api-patterns.md)
- Server actions patterns? → [server-actions.md](./server-actions.md)
- TypeScript patterns? → [coding-standards.md](./coding-standards.md)
- Feature organization? → [feature-structure.md](./feature-structure.md)
- General best practices? → [general.md](./general.md)

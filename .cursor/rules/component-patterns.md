# Component Patterns

## UI Component Structure

UI components follow the shadcn/ui pattern with Radix UI primitives.

### Component File Organization

**UI Components** (in `components/ui/`):

For composite components, use a directory structure:

```
components/ui/[component-name]/
├── [component-name].tsx      # Main component
├── [component-name]-variants.ts  # Variant definitions (if using CVA)
└── index.ts                  # Public exports
```

For simple components, a single file is acceptable:

```
components/ui/[component-name].tsx
```

**Feature Components** (in `features/[feature]/components/`):

Use directory structure with sub-components:

```
features/[feature]/components/[component-name]/
├── [component-name].tsx           # Main component
├── [component-name]-[variant].tsx  # Sub-components (e.g., chat-message-assistant.tsx)
├── [component-name]-[part].tsx    # Component parts (e.g., chat-message-actions.tsx)
└── index.ts                        # Public exports
```

Example:

```
features/chat/components/chat-message/
├── chat-message.tsx
├── chat-message-assistant.tsx
├── chat-message-user.tsx
└── index.ts
```

### Component Pattern

```typescript
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "md",
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Variant Patterns

Use `class-variance-authority` (CVA) for component variants:

```typescript
import { type VariantProps, cva } from "class-variance-authority";

export const buttonVariants = cva("base-classes", {
    variants: {
        variant: {
            default: "default-classes",
            destructive: "destructive-classes",
        },
        size: {
            sm: "small-classes",
            md: "medium-classes",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "md",
    },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use `tailwind-merge` to handle class conflicts
- Prefer composition over complex conditional logic

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

### Component Props

- Extend native HTML element props when appropriate
- Use discriminated unions for mutually exclusive props
- Provide sensible defaults
- Make props optional when they have defaults

```typescript
// ✅ Good - Extends native props
type ButtonProps = React.ComponentProps<"button"> & {
    variant?: "default" | "destructive";
};

// ✅ Good - Discriminated union
type InputProps =
    | ({ type: "email" } & EmailInputProps)
    | ({ type: "password" } & PasswordInputProps);
```

### Server vs Client Components

- **Default**: Server Components (no directive needed)
- **Use Client**: Add `"use client"` when you need:
    - React hooks (`useState`, `useEffect`, etc.)
    - Event handlers (`onClick`, `onChange`, etc.)
    - Browser APIs (`window`, `document`, etc.)
    - Context providers (TanStack Query, etc.)
    - Third-party client-only libraries

```typescript
// ✅ Server Component (default)
export function StaticContent() {
  return <div>Static content</div>;
}

// ✅ Client Component
"use client";

import { useState } from "react";

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Component Composition

Prefer composition over prop drilling:

```typescript
// ✅ Good - Composition
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

// ❌ Avoid - Prop drilling
<Dialog
  trigger={<button>Open</button>}
  title="Title"
  content="..."
/>
```

### Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Radix UI components handle accessibility automatically - use them

### Component Exports

Always use named exports for components:

```typescript
// ✅ Good
export function Button() { }

// ❌ Avoid
export default function Button() { }
```

Use `index.ts` files for cleaner imports:

```typescript
// components/ui/button/index.ts
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// features/chat/components/chat-message/index.ts
export { ChatMessage } from "./chat-message";
export { ChatMessageAssistant } from "./chat-message-assistant";
export { ChatMessageUser } from "./chat-message-user";
```

Then import as:

```typescript
// UI components
import { Button } from "@/components/ui/button";

// Feature components
import {
    ChatMessage,
    ChatMessageAssistant,
} from "@/features/chat/components/chat-message";
```

### Loading States

Provide loading states for async operations:

```typescript
export function Button({
  isLoading,
  loadingIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          {loadingIcon || <Spinner />}
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### Tooltips

Use Radix UI Tooltip component for tooltips:

```typescript
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger asChild>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Tooltip text</p>
  </TooltipContent>
</Tooltip>
```

### Icon Usage

- Use `lucide-react` for most icons (configured in components.json)
- Use `@tabler/icons-react` when needed
- Use `react-icons` sparingly if specific icons needed
- Import icons directly, not from a barrel export

```typescript
import { IconLoader2 } from "@tabler/icons-react";
import { Check, X } from "lucide-react";
```

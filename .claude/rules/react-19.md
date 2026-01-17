# React 19 Rules

Prefix: **RX-**

These rules emphasize minimalism, readability, and self-explanatory code while leveraging React 19 features and **mhwar project conventions** (Shadcn/UI components are located under `@/components/ui`).

- **RX-1** (MUST) Champion simplicity: Always choose the most basic component structure that meets requirements. Avoid unnecessary complexity.
- **RX-2** (MUST) Avoid unnecessary abstractions: Do not introduce higher-order components, wrappers, or extra layers unless strictly required for reuse or separation of concerns.
- **RX-3** (MUST) Prioritize self-documenting code: Use clear, descriptive prop/variable names and straightforward patterns. Comments should be rare and only for truly non-obvious logic.
- **RX-4** (MUST) Exclusively import UI primitives from `@/components/ui` (e.g., `import { Button } from '@/components/ui/button'`).
- **RX-5** (SHOULD) When building new components, follow existing patterns in the codebase (especially in `src/components/` and feature folders).
- **RX-6** (SHOULD) Compose new UI elements from existing Shadcn/UI primitives whenever possible instead of building from scratch.
- **RX-7** (MUST) Do not use `forwardRef`. In React 19, pass `ref` directly as a prop (e.g., `ref?: React.Ref<HTMLButtonElement>`).
- **RX-8** (SHOULD) Use `useEffect` sparingly. Most logic should live in render, event handlers, or derived state. If an effect is needed, add a concise comment justifying it.
- **RX-9** (MUST) Start with the minimal viable component implementation. Maximize reuse of existing UI components.
- **RX-10** (MUST) Keep files single-responsibility: One primary exported component per file.
- **RX-11** (MUST) Define all props with explicit TypeScript interfaces (or types). Include `ref?` if the component forwards to a DOM element.
- **RX-12** (SHOULD) Resist premature optimization or generalization. Add memoization/performance tweaks only when profiling shows need.
- **RX-13** (MUST) Before considering a component "done", run this mental checklist:
  - All UI imports are from `@/components/ui`
  - No `forwardRef` usage
  - `useEffect` is minimal and justified
  - The feature works with even simpler code?
  - Props and naming are intuitive and consistent with project conventions
  - File organization follows existing patterns

### Example Ideal Component (aligned with mhwar conventions)

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCallback, useState } from 'react';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  /** Optional ref to forward to the submit button */
  submitRef?: React.Ref<HTMLButtonElement>;
}

export function LoginForm({ onSubmit, submitRef }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({ email, password });
    },
    [email, password, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button ref={submitRef} type="submit">
        Login
      </Button>
    </form>
  );
}
```

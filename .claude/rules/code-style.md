# Code Style Rules

## TypeScript

- Strict mode always (`"strict": true` in tsconfig.json).
- No `any` unless truly unavoidable — if used, add an inline comment explaining why.
- Prefer `interface` for object shapes that describe data; `type` for unions, intersections, and aliases.
- Export types from `src/types/` when shared across multiple files.
- Use `satisfies` operator where it improves type narrowing without widening.

## Naming

- Files: `kebab-case.ts` for utilities and lib files; `PascalCase.tsx` for components.
- React components: `PascalCase`.
- Functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true module-level constants; `camelCase` for runtime values.
- Database model fields in Prisma: `camelCase` matching the schema exactly.

## React / Next.js

- Server Components by default. Only add `"use client"` when the component genuinely needs:
  - `useState`, `useEffect`, `useRef`, or other hooks
  - Event handlers (onClick, onChange, etc.)
  - Browser-only APIs
  - Recharts or other render-only client libraries
- Never add `"use client"` to layouts or page files unless the entire subtree needs it.
- Avoid passing non-serializable props from Server to Client Components.
- Use `async` Server Components for data fetching — no `useEffect` for data.

## Imports

- Use `@/*` alias (maps to `src/*`) for all project imports.
- Group imports: React/Next.js first, third-party second, local last; blank line between groups.
- No barrel files (`index.ts`) in `lib/` — import the specific module directly.

## Formatting

- 2-space indentation.
- Single quotes for strings in TypeScript/TSX; double quotes in JSX props.
- Semicolons: yes.
- Trailing commas: yes (ES5).
- Max line length: 100 characters (soft guide, not enforced by linter yet).

## Comments

- Default to no comments. Only comment when the WHY is non-obvious.
- Never describe what code does — well-named identifiers do that.
- One short line max. No multi-line comment blocks.

## Error handling

- Every external API call (Google, Meta, Neon) wraps in `try/catch`.
- Log structured errors: `console.error("[module] message", { error, context })`.
- Never swallow errors silently.
- Throw typed errors or return `{ data, error }` discriminated unions from lib functions.

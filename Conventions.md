# Frontend Conventions & Best Practices

> This document defines the conventions, patterns, and standards for this Next.js **16.2.x** project.
> It is the single source of truth for **Codex** (OpenAI's coding agent) and all human developers.
> When in doubt — check here first.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [Design System & Visual Language](#3-design-system--visual-language)
4. [Component Architecture](#4-component-architecture)
5. [TypeScript](#5-typescript)
6. [Styling (Tailwind CSS)](#6-styling-tailwind-css)
7. [State Management](#7-state-management)
8. [Data Fetching](#8-data-fetching)
9. [Routing & Navigation](#9-routing--navigation)
10. [Forms & Validation](#10-forms--validation)
11. [Error Handling](#11-error-handling)
12. [Performance](#12-performance)
13. [Accessibility (a11y)](#13-accessibility-a11y)
14. [Git & Commits](#14-git--commits)
15. [Environment Variables](#15-environment-variables)
16. [Codex Agent Rules](#16-codex-agent-rules)

---

## 1. Project Structure

Use the **App Router** (`/app` directory). Keep concerns co-located by feature.

```
├── app/
│   ├── (auth)/                   # Route groups (no URL segment)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                      # Route handlers
│   │   └── [...]/route.ts
│   ├── globals.css               # Only CSS variables, resets, base styles
│   └── layout.tsx                # Root layout — fonts, providers, metadata
│
├── components/
│   ├── ui/                       # Primitive, stateless design-system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── [feature]/                # Feature-specific compositions
│       ├── UserCard.tsx
│       └── UserCard.skeleton.tsx
│
├── design/                       # Design tokens, theme config, icon sets
│   ├── tokens.ts                 # All spacing, color, radius, shadow values
│   └── fonts.ts                  # next/font declarations
│
├── hooks/                        # Custom React hooks (use*.ts)
├── lib/                          # Utilities, helpers, third-party wrappers
│   ├── utils.ts                  # cn(), formatters, etc.
│   └── [service].ts
├── types/                        # Global TypeScript types & interfaces
│   └── index.ts
├── constants/                    # App-wide constants
│   └── index.ts
├── stores/                       # Zustand stores (one per domain)
├── actions/                      # Next.js Server Actions
│   └── [feature].ts
├── public/                       # Static assets — images, fonts, icons
└── middleware.ts
```

**Rules:**
- Group by **feature**, not by file type.
- Every design decision that recurs more than once belongs in `design/tokens.ts`.
- `components/ui/` components are **pure** — no API calls, no business logic, no hardcoded copy.

---

## 2. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Components | `PascalCase` | `UserProfile.tsx` |
| Skeleton variants | `PascalCase` + `.skeleton` | `UserProfile.skeleton.tsx` |
| Hooks | `camelCase` prefixed `use` | `useAuthSession.ts` |
| Utilities / helpers | `camelCase` | `formatDate.ts` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE` |
| Types / Interfaces | `PascalCase` | `UserProfile`, `ApiResponse<T>` |
| Design tokens | `camelCase` in `tokens.ts` | `colorBrand`, `radiusMd` |
| Route files | Next.js conventions | `page.tsx`, `layout.tsx`, `route.ts` |
| Server Actions | `camelCase`, verb-first | `createUser`, `deletePost` |

**Component filenames must exactly match the default export name.**

```tsx
// ✅ Good — file: components/ui/Button.tsx
export default function Button({ ... }) { ... }

// ❌ Bad — misleading filename
// file: components/ui/btn.tsx
export default function Button({ ... }) { ... }
```

---

## 3. Design System & Visual Language

> **This is the most important section.** A beautiful, consistent UI is a first-class concern — not an afterthought. Codex must read and respect this section before touching any component or style.

### 3.1 Philosophy

The UI should feel **intentional, cohesive, and crafted** — not assembled from random defaults. Every visual decision should serve the product's tone. There are no "good enough" margins or "close enough" colors.

- **Consistency over creativity in implementation** — novel ideas belong in `design/tokens.ts`, not scattered inline.
- **Every component has one canonical look** — no ad-hoc styling that deviates from the system.
- **Design at the edges** — pay obsessive attention to empty states, loading states, error states, and disabled states. These are where amateur UIs fall apart.
- **Restraint is a feature** — prefer a small, cohesive palette over expressive chaos. When unsure, do less.

### 3.2 Design Tokens

All design decisions live in `design/tokens.ts` and are surfaced as Tailwind theme extensions. **Never hardcode a raw color, shadow, or radius that already has a token.**

```ts
// design/tokens.ts
export const tokens = {
  color: {
    brand:        "hsl(221 83% 53%)",
    brandSubtle:  "hsl(221 83% 96%)",
    danger:       "hsl(0 72% 51%)",
    success:      "hsl(142 71% 45%)",
    warning:      "hsl(38 92% 50%)",
    textPrimary:  "hsl(222 47% 11%)",
    textMuted:    "hsl(215 16% 47%)",
    border:       "hsl(214 32% 91%)",
    surface:      "hsl(0 0% 100%)",
    subtle:       "hsl(210 40% 98%)",
  },
  radius: {
    sm:   "0.25rem",
    md:   "0.5rem",
    lg:   "0.75rem",
    xl:   "1rem",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  },
};
```

Map tokens into `tailwind.config.ts`:

```ts
// tailwind.config.ts
import { tokens } from "./design/tokens";

export default {
  theme: {
    extend: {
      colors:        tokens.color,
      borderRadius:  tokens.radius,
      boxShadow:     tokens.shadow,
    },
  },
};
```

### 3.3 Typography

- Fonts are declared **once** in `design/fonts.ts` using `next/font`.
- A maximum of **2 font families** per project: one heading, one body.
- Never use system fonts or raw `@import`.
- The type scale lives in `tailwind.config.ts` — no ad-hoc `text-[17px]`.

```ts
// design/fonts.ts
import { Geist, Geist_Mono } from "next/font/google";

export const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
export const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

**Typographic hierarchy rules:**

| Element | Role | Rule |
|---|---|---|
| `h1` | Page title | Used **once per page**, never inside a component |
| `h2` | Section title | Max one per visible section |
| `h3` | Card / panel title | Inside components |
| `p` | Body copy | Default `leading-relaxed` |
| `small` / `text-sm text-textMuted` | Supporting / meta text | Timestamps, labels, hints |

### 3.4 Spacing

Use Tailwind's spacing scale. Prefer **multiples of 4** (`p-4`, `gap-6`, `mt-8`). Do not use arbitrary values.

| Context | Class range |
|---|---|
| Component internal padding | `p-4` → `p-6` |
| Between sibling elements | `gap-3` → `gap-6` |
| Between page sections | `mt-12` → `mt-20` |
| Icon-to-text gap | `gap-2` |

### 3.5 Color Usage Rules

- **Brand** — CTAs, active states, links
- **Surface / Subtle** — card backgrounds, input fills
- **TextMuted** — timestamps, placeholders, labels
- **Danger** — destructive actions, form errors, alerts
- **Success / Warning** — status badges only

Never use raw Tailwind palette classes (`bg-blue-500`) in product code. Always use the semantic token names mapped to your theme (`bg-brand`, `text-textMuted`).

### 3.6 Motion & Animation

Animations must be **purposeful** — they communicate state changes, guide attention, or provide feedback. Never animate for decoration alone.

**Rules:**
- Duration: `150ms` for micro-interactions, `200–300ms` for layout transitions, `400ms` max for page reveals.
- Easing: `ease-out` for entering elements, `ease-in` for leaving, `ease-in-out` for toggles.
- Respect `prefers-reduced-motion` — wrap non-essential animations in a `useReducedMotion` check.
- Use CSS transitions for simple state changes; use Framer Motion for complex sequences.

```tsx
// ✅ Good — communicates state change
<div className="transition-opacity duration-200 ease-out" style={{ opacity: isVisible ? 1 : 0 }} />

// ❌ Bad — decorative, meaningless motion
<div className="animate-bounce" />
```

### 3.7 Iconography

- Use a **single icon library** throughout (e.g., Lucide React).
- Icon-only interactive elements must have `aria-label` or a sibling `<span className="sr-only">`.
- Sizing: `size-4` inline with text, `size-5` in buttons, `size-6` standalone.
- Never use emoji as functional UI icons.

### 3.8 Dark Mode

- `darkMode: "class"` in Tailwind config.
- Every color token must have a `dark:` variant, defined in `globals.css` under `.dark {}`.
- Every new component must be verified in both light and dark modes before it is considered done.

---

## 4. Component Architecture

### 4.1 Server vs. Client Components

- **Default to Server Components.** Add `"use client"` only when you need:
  - Browser APIs (`window`, `document`, `localStorage`)
  - React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
  - Event listeners

```tsx
// ✅ Server Component — zero JS sent to client
export default async function ProductList() {
  const products = await db.product.findMany();
  return (
    <ul className="grid gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
```

```tsx
// ✅ Client Component — only when interaction is needed
"use client";
import { useState } from "react";

export default function QuantityPicker({ max }: { max: number }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
      <span>{qty}</span>
      <button onClick={() => setQty(q => Math.min(max, q + 1))}>+</button>
    </div>
  );
}
```

### 4.2 Component File Structure (order is enforced)

```tsx
"use client"; // 1. Directive — omit entirely for Server Components

// 2. External imports
import { useState } from "react";
import Image from "next/image";

// 3. Internal imports
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types";

// 4. Local types — props interface always named Props
interface Props {
  user: User;
  className?: string;   // always accept className for composability
  onAction: (id: string) => void;
}

// 5. Component — named function, never anonymous
export default function UserCard({ user, className, onAction }: Props) {
  // 5a. All hooks at the top
  const { session } = useAuth();

  // 5b. Derived state
  const displayName = `${user.firstName} ${user.lastName}`;

  // 5c. Event handlers (handle* prefix)
  const handleClick = () => onAction(user.id);

  // 5d. Early returns for edge states
  if (!user) return null;

  // 5e. Render
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4 shadow-sm", className)}>
      <p className="text-sm font-medium text-textPrimary">{displayName}</p>
      <Button onClick={handleClick} size="sm" className="mt-3">
        View Profile
      </Button>
    </div>
  );
}
```

### 4.3 Component Rules

- **Single responsibility** — one component, one job. If it's doing two things, split it.
- **200-line limit** — components longer than 200 lines must be decomposed.
- **Always accept `className`** as an optional prop on UI components.
- **Always name your function** — no anonymous default exports.
- **Prop drilling max 2 levels** — beyond that, use context or a store.
- **Every component handles its own edge states** — never assume clean, loaded data.
- **Skeleton variants are not optional** — every component with async data needs a `Component.skeleton.tsx`.

### 4.4 UI Primitive Checklist

Before shipping any `components/ui/` component, verify all boxes:

- [ ] Accepts and forwards `className`
- [ ] Accepts and forwards relevant HTML `...rest` attributes
- [ ] Uses `cva` for variant + size props
- [ ] Works in dark mode
- [ ] Has a visible `focus-visible` ring
- [ ] Has a `disabled` state
- [ ] Contains no hardcoded colors, copy, or sizes

```tsx
// ✅ Correct primitive — cva variants, forwarded props, cn() merging
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand/90",
        outline: "border border-border bg-transparent hover:bg-subtle",
        ghost:   "hover:bg-subtle hover:text-textPrimary",
        danger:  "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm:   "h-8 px-3 text-xs",
        md:   "h-10 px-4 text-sm",
        lg:   "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

---

## 5. TypeScript

- **Strict mode on.** `"strict": true` in `tsconfig.json` — no exceptions.
- Prefer `interface` for object shapes; `type` for unions, intersections, aliases.
- Never use `any`. Use `unknown` and narrow. Use `never` to assert exhaustiveness.
- Always type exported function parameters and return values.
- Use `satisfies` to validate objects against a type while preserving literal types.
- Co-locate local types with their component; shared types live in `types/index.ts`.

```ts
// ✅ Good
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

// ❌ Bad
const fetchUser = async (): Promise<any> => { ... };
```

---

## 6. Styling (Tailwind CSS)

- Tailwind CSS is the **only** styling tool. No custom CSS except:
  - CSS custom properties in `globals.css`
  - Keyframe animations not achievable with Tailwind utilities
- Use `cn()` for all conditional or merged class names.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- **Mobile-first**: base styles for mobile, add `sm:`, `md:`, `lg:` breakpoints above.
- **No arbitrary values** (`text-[13px]`, `mt-[22px]`) unless a pixel-perfect off-scale value is explicitly required by the design and documented inline.
- **Long className strings must be broken across lines.**

```tsx
// ✅ Readable
<div
  className={cn(
    "flex flex-col rounded-lg border border-border bg-surface",
    "p-4 shadow-sm transition-shadow hover:shadow-md",
    isActive && "ring-2 ring-brand ring-offset-2",
    className
  )}
/>
```

---

## 7. State Management

| Scope | Tool |
|---|---|
| Local UI state | `useState` / `useReducer` |
| Shared UI state (theme, modals, toasts) | Zustand |
| Server / async state | TanStack Query |
| URL / query params | `useSearchParams` + `nuqs` |
| Forms | React Hook Form + Zod |

- **Never store server data in global state.** TanStack Query owns the server cache.
- Keep Zustand stores **small and domain-focused** — one store per concern.
- Avoid `useEffect` for derived state — compute during render or use `useMemo`.

---

## 8. Data Fetching

### Server Components (default)

```tsx
export default async function OrderList() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });

  if (orders.length === 0) return <OrderListEmpty />;

  return (
    <ul className="grid gap-3">
      {orders.map(o => <OrderCard key={o.id} order={o} />)}
    </ul>
  );
}
```

### Server Actions (mutations)

```ts
// actions/order.ts
"use server";
import { revalidateTag } from "next/cache";

export async function cancelOrder(id: string) {
  try {
    await db.order.update({ where: { id }, data: { status: "cancelled" } });
    revalidateTag("orders");
    return { success: true };
  } catch {
    return { success: false, error: "Could not cancel this order." };
  }
}
```

### Client-side (TanStack Query)

```tsx
const { data, isPending, isError } = useQuery({
  queryKey: ["orders", filters],
  queryFn: () => fetchOrders(filters),
  staleTime: 60_000,
});

if (isPending) return <OrderList.Skeleton />;
if (isError)   return <OrderListError />;
```

**Rules:**
- Always handle `loading`, `error`, and `empty` states — no exceptions.
- Never fetch inside a raw `useEffect`.
- Use `revalidateTag` over `revalidatePath` for granular cache invalidation.

---

## 9. Routing & Navigation

- Use `<Link>` from `next/link` for all internal navigation — never a bare `<a>`.
- Use `useRouter` only for **programmatic** navigation (post-submit redirects, etc.).
- Prefer **route groups** `(group)` to share layouts without URL impact.
- Always define `generateMetadata` in every `page.tsx`.
- Dynamic segments: `[id]` single, `[...slug]` catch-all, `[[...slug]]` optional.

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} — Acme Store`,
    description: product.tagline,
    openGraph: { images: [product.image] },
  };
}
```

---

## 10. Forms & Validation

- **React Hook Form** for all forms.
- **Zod** for all schemas — shared between client and server.

```ts
// lib/schemas/checkout.ts
import { z } from "zod";

export const checkoutSchema = z.object({
  email:   z.string().email("Enter a valid email"),
  address: z.string().min(5, "Enter a full address"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

```tsx
const form = useForm<CheckoutInput>({
  resolver: zodResolver(checkoutSchema),
  defaultValues: { email: "", address: "" },
});
```

- Server Actions **must** also validate with Zod — client validation is never sufficient alone.
- Errors display **at the field level**, not just as a toast.
- Submit button must show a loading state via `form.formState.isSubmitting`.

---

## 11. Error Handling

- `error.tsx` — route-level boundary with a user-friendly message and a retry button.
- `not-found.tsx` — 404 with helpful navigation options.
- Server Actions return `{ success: true }` or `{ success: false, error: string }` — never throw to the client.
- **Never expose raw errors, stack traces, or internal IDs to the client.**
- Log server errors to an observability service (Sentry, Axiom, etc.).

```ts
// ✅ Safe Server Action error pattern
export async function createPost(input: CreatePostInput) {
  try {
    const post = await db.post.create({ data: input });
    revalidateTag("posts");
    return { success: true, data: post };
  } catch (err) {
    console.error("[createPost]", err);
    return { success: false, error: "Failed to create post. Please try again." };
  }
}
```

---

## 12. Performance

- `next/image` for **every** image — always set `alt`, `width`, `height`, and `priority` for above-the-fold images.
- `next/font` for all fonts — never `@import` or `<link>` tags.
- Lazy-load heavy Client Components with `dynamic()`.

```tsx
const Chart = dynamic(() => import("@/components/analytics/Chart"), {
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  ssr: false,
});
```

- `useMemo` for expensive computations; `useCallback` only when passed to a memoized child.
- `React.memo` only after profiling confirms a bottleneck.
- Reserve space for async content using skeleton components — eliminate layout shift.
- Run `@next/bundle-analyzer` before each major release.

---

## 13. Accessibility (a11y)

- Use **semantic HTML** — `<button>`, `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`.
- Every `<img>` needs a descriptive `alt` (or `alt=""` for decorative images).
- All interactive elements must be keyboard-operable.
- `aria-*` only when semantic HTML is insufficient.
- Color contrast: **WCAG AA minimum** (4.5:1 for normal text, 3:1 for large text).
- Every form field must have a visible, associated `<label>`.
- Modals and drawers trap focus and close on `Escape`.
- Use `className="sr-only"` for screen-reader-only text on icon-only buttons.

---

## 14. Git & Commits

Follow **Conventional Commits**:

```
feat(auth): add magic-link login
fix(cart): prevent negative quantity on decrement
chore(deps): upgrade Next.js to 16.2.1
refactor(ui): replace custom Button with cva variant system
style(dashboard): align card grid to 4-column layout
perf(images): add priority flag to hero image
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `style`, `perf`, `docs`, `ci`

- Commits are **atomic** — one logical change per commit.
- Imperative mood: "add feature" not "added feature".
- Branch naming: `feat/`, `fix/`, `chore/` + `kebab-case-description`.

---

## 15. Environment Variables

- All secrets live in `.env.local` — never committed.
- Browser-exposed vars are prefixed `NEXT_PUBLIC_`.
- Every variable is documented in `.env.example` with a description.
- Validate all env vars at startup using Zod.

```ts
// lib/env.ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL:        z.string().url(),
  NEXTAUTH_SECRET:     z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = schema.parse(process.env);
```

---

## 16. Codex Agent Rules

> These rules govern how **Codex** must behave in this codebase. Read all of them before writing a single line.

### 16.1 General Behavior

- **Read before writing.** Always read the file(s) you're about to modify.
- **Minimal diffs.** Solve the problem with the smallest possible change. Do not refactor unrelated code.
- **No speculative additions.** Only implement what was asked. Surface other improvements as a comment — never silently apply them.
- **Follow existing patterns first.** Before introducing a new pattern, check if the codebase already solves the problem. Consistency beats cleverness.
- **Explain non-obvious decisions** with a concise inline comment.

### 16.2 Design & Component Rules (STRICT — never violate)

1. **Never hardcode a color, font, radius, or shadow** outside of `design/tokens.ts`. Use the token → Tailwind pipeline.
2. **Never deviate from the component file structure** defined in Section 4.2.
3. **Always check `components/ui/`** before building a new primitive. Reuse; do not duplicate.
4. **Always use `cva` + `cn()`** for variants in UI primitives — no manual conditional string building.
5. **Every UI primitive must accept and forward `className`** and relevant HTML attributes.
6. **Never use inline `style={{ }}`** except for dynamic CSS custom property assignments (e.g., `style={{ "--progress": `${pct}%` }}`).
7. **Dark mode must work** on every new component. Verify `dark:` variants before considering a component done.
8. **Never build a component without all three edge states:** empty, loading (skeleton), and error. A component is not done until all three are handled.
9. **Never place a component's visual logic in its parent.** If it changes how it looks, the component handles it via props.
10. **Respect the type scale and spacing scale.** Do not introduce arbitrary `text-[Npx]` or `mt-[Npx]` values.

### 16.3 When Creating New Components

1. Check `components/ui/` — does a primitive already exist?
2. Create the file following the structure in Section 4.2.
3. Default to **Server Component**. Add `"use client"` only if required.
4. Type props with `interface Props` — never `any`.
5. Accept `className` as an optional prop.
6. Use `cn()` + `cva` for all class logic.
7. Implement empty, loading (skeleton), and error states.
8. Verify in both light and dark modes.

### 16.4 When Creating New Routes

1. Create `page.tsx` with `generateMetadata`.
2. Create `loading.tsx` with a skeleton that matches the page structure.
3. Create `error.tsx` with a user-friendly message and a retry button.

### 16.5 When Adding New Dependencies

- Check whether the functionality already exists in the project.
- Prefer small, focused packages over large multi-purpose ones.
- Pin the version: `npm install package@x.y.z`.
- Update `.env.example` if the package requires configuration.

### 16.6 When Fixing Bugs

- Identify the root cause before touching code.
- Fix the root cause — not the symptom.
- Do not modify unrelated code in the same commit.

### 16.7 Code Quality Non-Negotiables

- No `console.log` in committed code — use a logger.
- No hardcoded strings that belong in constants or env vars.
- No `TODO` comments without a GitHub issue reference.
- No `@ts-ignore` or `@ts-expect-error` without an explanatory comment.
- No unused imports, variables, or dead code.
- No `any` — ever.

### 16.8 Folder Placement Quick Reference

| What | Where |
|---|---|
| New page | `app/[route]/page.tsx` |
| New layout | `app/[route]/layout.tsx` |
| Reusable UI primitive | `components/ui/ComponentName.tsx` |
| Feature component | `components/[feature]/ComponentName.tsx` |
| Skeleton variant | `components/[feature]/ComponentName.skeleton.tsx` |
| Custom hook | `hooks/use[Name].ts` |
| Server Action | `actions/[feature].ts` |
| API helper / service | `lib/[service].ts` |
| Zod schema | `lib/schemas/[name].ts` |
| Global type | `types/index.ts` |
| Design token | `design/tokens.ts` |
| Font declaration | `design/fonts.ts` |
| Constant | `constants/index.ts` |
| Zustand store | `stores/[domain].store.ts` |

---

*Last updated: April 2026 — keep this document in sync with the project as it evolves. If a convention changes, update here first.*
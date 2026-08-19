# TECH.md

## What is it?

**React Server Components (RSC) with Next.js 15 App Router** — The most significant architectural shift in React since Hooks (2019). RSC allows components to run exclusively on the server, sending only serialized UI (not JavaScript) to the client. Next.js 15 (released Oct 2024) stabilizes this with:

- **Server Components by default** — All components in `app/` are server components unless `'use client'`
- **Streaming SSR** — `Suspense` boundaries stream HTML as it's ready
- **Server Actions** — Mutations via RPC-like functions (`'use server'`)
- **Partial Prerendering (PPR)** — Static shell + dynamic islands (experimental)
- **Turbopack** — Rust-based bundler (stable in Next.js 15)

Key distinction: **Zero client JS for static/interactive-less UI**. Client components (`'use client'`) opt into interactivity.

---

## How could Stunning use it?

### 1. Landing Page Performance
- **Hero, features, pricing, footer** → Pure Server Components (0 KB JS)
- Only the builder form (`PromptInput`, `IntegrationSelector`) needs `'use client'`
- Result: ~50-70% less client JS vs SPA, faster FCP/LCP, better SEO

### 2. Streaming AI Responses (Native)
```tsx
// app/page.tsx (Server Component)
async function GenerateResponse({ prompt, integrations }) {
  const stream = await generateStream(prompt, integrations);
  return <Suspense fallback={<Skeleton />}>
    <StreamingMarkdown stream={stream} />
  </Suspense>;
}
```
- No API route needed — Server Action streams directly to client
- `ReadableStream` + `React.use` (canary) or `Suspense` for progressive rendering
- Eliminates separate fetch + SSE complexity

### 3. SEO-Critical Pages
- Documentation, blog, templates → Fully static (ISR) or dynamic Server Components
- Metadata, Open Graph, JSON-LD generated at request time
- No client hydration for content pages

### 4. Database Access in Components
```tsx
// Server Component — direct DB access, no API layer
async function UserHistory({ userId }) {
  const generations = await db.generation.findMany({ where: { userId } });
  return <HistoryList items={generations} />;
}
```
- Colocate data fetching with UI
- Eliminates waterfall requests (client → API → DB)

### 5. Edge-Ready Server Actions
```tsx
// 'use server' — runs at edge, no cold start
export async function saveGeneration(data) {
  const session = await auth();
  return db.generation.create({ data: { ...data, userId: session.user.id } });
}
```
- Form submissions, mutations without API routes
- Progressive enhancement (works without JS)

---

## What are its limitations?

### 1. Mental Model Shift
- **No `useEffect`, `useState`, browser APIs** in Server Components
- Event handlers must be in Client Components
- Props must be serializable (no functions, class instances, Date objects)
- Team onboarding cost: 2-4 weeks for React veterans

### 2. Caching Complexity
- **Four cache layers**: Request Memoization, Data Cache, Full Route Cache, Router Cache
- `fetch()` extends `NextRequest` with `next: { revalidate, tags }`
- `unstable_cache()` for granular control
- Cache invalidation via `revalidatePath()` / `revalidateTag()` — easy to over/under-invalidate
- PPR adds another dimension (static shell vs dynamic holes)

### 3. Bundle Size Paradox
- Server Components don't ship JS — but **Client Components still do**
- `next/bundle-analyzer` shows duplicate code if not careful
- Heavy libs (date-fns, lodash, charts) in Client Components = same problem
- Solution: Move logic to Server Components, pass minimal data

### 4. Streaming Gotchas
- `Suspense` boundaries must wrap at layout/page level
- `Transfer-Encoding: chunked` breaks some CDNs/proxies
- Error boundaries (`error.tsx`) don't catch streaming errors mid-flight
- `Connection: close` on error — client must handle reconnection

### 5. Ecosystem Maturity
- Many libraries not RSC-ready (require `'use client'` at root)
- Testing: `@testing-library/react` works, but Server Components need `React Testing Library` + `next/test-utils` or Vitest environment
- Storybook: Experimental RSC support
- DevTools: React DevTools v5+ supports RSC, but limited

### 6. Deployment Constraints
- **Vercel**: First-class support, Edge Functions, ISR, PPR
- **Docker/Node**: `output: 'standalone'` works, but no ISR/Edge without custom infra
- **Static Export**: `output: 'export'` loses Server Components entirely (all Client)

---

## Would you use it today? Why or why not?

**Yes, for new projects — with guardrails.**

### Why Yes:
1. **Performance default** — 0 KB JS for static content is a genuine breakthrough
2. **Architecture simplification** — Colocated data fetching removes API layer boilerplate
3. **Streaming UX** — Native streaming without custom SSE/WebSocket code
4. **Vercel alignment** — Best DX on Vercel; if deploying there, it's the happy path
5. **Future-proof** — React 19 + RSC is the direction; delaying adoption increases migration cost

### Guardrails for Adoption:
| Rule | Rationale |
|------|-----------|
| Default to Server Components | Only add `'use client'` when interactivity needed |
| Extract Client Components to leaves | Keep server tree pure; push interactivity to edges |
| Use Server Actions for mutations | Avoid API routes for forms/mutations |
| Tag all `fetch()` calls | `next: { tags: ['generations'] }` enables surgical revalidation |
| Monitor bundle with `@next/bundle-analyzer` | Catch Client Component bloat early |
| Document cache strategy per route | Prevent "works on my machine" caching bugs |

### When NOT to use:
- **Team unfamiliar with React** — Steep learning curve
- **Heavy client-state apps** (Figma-like, real-time collab) — RSC adds complexity
- **Non-Vercel deployment without infra investment** — Lose ISR/Edge benefits
- **Existing large SPA** — Incremental migration possible but painful

### For This Task (Stunning Builder):
**Partial adoption** — The landing page and response display are perfect Server Components. Only the form (`PromptInput`, `IntegrationSelector`) needs `'use client'`. The API route could become a Server Action. This project would ship ~40% less JS with full RSC adoption.
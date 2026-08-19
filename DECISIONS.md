# DECISIONS.md

## What did you improve?

### 1. Streaming AI Responses
**Before**: Blocking request — user waits 10-30s for full response.
**After**: Server-Sent Events (SSE) streaming — first tokens appear in <1s, full response streams in real-time. Dramatically improves perceived performance and UX.

### 2. Input Validation & Error Handling
- Zod schema validation on both client and server
- Character limits (10-2000 chars) with live counter
- Graceful error states with retry button
- Groq API error mapping (rate limits, auth, model errors)

### 3. Integration Context Injection
- Each integration has detailed `systemPromptContext` with:
  - Recommended SDKs and APIs
  - Authentication patterns
  - Key operations and code patterns
  - Rate limits and quotas
  - Security best practices
- Selected integrations dynamically compose into system prompt
- Multi-select with "Select all" and visual chips

### 4. Accessibility (a11y)
- Semantic HTML structure
- ARIA labels on all interactive elements
- Keyboard navigation for integration selector
- Focus visible states
- Live region for streaming content updates
- Color contrast ratios (WCAG AA)

### 5. Copy & UX Polish
- Hero section with value proposition
- Integration descriptions and visual chips
- Loading states with skeleton/spinner
- Copy-to-clipboard with feedback
- Empty state with clear call-to-action
- Responsive design (mobile-first)

### 6. Code Quality
- Strict TypeScript with proper interfaces
- Modular architecture (separation of concerns)
- Reusable shadcn/ui components
- Custom markdown renderer (no heavy deps)
- Environment variable validation

---

## What did you intentionally leave out?

### 1. Authentication & User Accounts
- No auth, sessions, or user management
- Anonymous usage only
- Would need: NextAuth.js, database, email/password or OAuth

### 2. Persistence & History
- No database — responses not saved
- No history of previous generations
- Would need: PostgreSQL (Vercel Postgres/Supabase), Prisma/Drizzle

### 3. Real Integration Connections
- Integrations are **context-only** for AI
- No OAuth flows, token storage, or API calls to external services
- Would need: Encrypted token storage, background jobs, webhook handlers

### 4. Rate Limiting & Abuse Prevention
- Basic in-memory rate limiting (not implemented)
- No CAPTCHA, no IP tracking, no usage quotas
- Would need: Upstash Redis + `@upstash/ratelimit`, Arcjet, or Vercel Edge Middleware

### 5. Observability & Monitoring
- No logging, metrics, or error tracking
- Would need: Sentry, Logtail, Vercel Analytics, OpenTelemetry

### 6. Testing
- No unit, integration, or E2E tests
- Would need: Vitest + React Testing Library, Playwright

### 7. CI/CD Pipeline
- No GitHub Actions, no preview deployments
- Would need: `.github/workflows/ci.yml` with lint, typecheck, test, build

### 8. Advanced AI Features
- No conversation memory (stateless)
- No prompt templates or saved presets
- No model selection (fixed to Llama 3.1 70B via Groq)
- No function calling / tool use

### 9. Internationalization
- English only
- Would need: next-intl or i18next

### 10. Design System Extensions
- No dark mode toggle (follows system)
- No custom theming beyond shadcn defaults
- No animation library (Framer Motion)

---

## What is the biggest production risk?

### 4. AI Provider Lock-in & Failure Modes

**Risk**: The entire core feature depends on a single external API (Groq / Llama 3.1 70B).

**Failure Scenarios**:
1. **API Downtime** — Groq outage = feature completely broken
2. **Rate Limits** — Sudden traffic spike hits tier limits → 429 errors
3. **Model Deprecation** — Llama 3.1 70B retired, migration required
4. **Latency Variance** — P99 latency >30s causes timeouts
5. **Content Policy Changes** — Valid prompts suddenly rejected

**Mitigations Needed for Production**:
- **Circuit Breaker** — Fail fast, show cached/fallback responses
- **Multi-Provider Fallback** — OpenRouter or OpenAI as backup
- **Request Queuing** — BullMQ/Upstash Queue for traffic spikes
- **Usage Monitoring** — Daily spend alerts, per-user quotas
- **Response Caching** — Cache common prompts (Redis)
- **Timeout Handling** — 30s max, stream partial response on timeout
- **Content Moderation** — Pre-filter prompts, log violations

**Secondary Risk**: **No Persistence** — Users lose generated specs on refresh. No way to share, iterate, or export. Core value proposition requires "save/share/export" to be viable long-term.
# Stunning Builder — AI-Powered Build Planner

A full-stack landing page that takes a user's product idea and selected integrations, then generates a detailed technical specification using Llama 3.1 70B (via Groq).

**Repository:** https://github.com/AhmadAymanA99/stunning-task

## Features

- **Prompt Input** — Describe what you want to build
- **Integration Selector** — Choose from Stripe, Shopify, Gmail, Slack, Google Sheets
- **AI Generation** — Streaming response from Llama 3.1 70B with integration-specific context
- **Production-Ready Output** — Architecture, tech stack, file structure, code examples, security, deployment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI**: Groq (Llama 3.1 70B Versatile) — Free tier available
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Groq API key (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/AhmadAymanA99/stunning-task.git
cd stunning-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your free API key from [Groq Console](https://console.groq.com/keys).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # Streaming AI generation endpoint
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles + prose
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── PromptInput.tsx          # Prompt textarea + submit
│   ├── IntegrationSelector.tsx  # Multi-select for integrations
│   ├── ResponseDisplay.tsx      # Streaming markdown display
│   └── MarkdownContent.tsx      # Simple markdown renderer
├── lib/
│   ├── integrations.ts          # Integration definitions + context
│   ├── prompt-builder.ts        # System prompt construction
│   └── utils.ts                 # cn() helper
└── types/
    └── index.ts                 # TypeScript interfaces
```

## How It Works

1. User enters a prompt and selects integrations
2. On submit, the frontend calls `/api/generate` with prompt + integration IDs
3. Backend validates input, builds system prompt with integration contexts
4. Requests Llama 3.1 70B via Groq with streaming enabled
5. Frontend displays streaming response in real-time
6. User can copy the generated specification

## Integrations

Each integration injects specific context into the system prompt:

- **Stripe** — PaymentIntents, Subscriptions, Webhooks, idempotency
- **Shopify** — Admin API (GraphQL/REST), Products, Orders, Webhooks
- **Gmail** — Gmail API, OAuth, MIME, batch requests
- **Slack** — Bolt SDK, Block Kit, Socket Mode, rate limits
- **Google Sheets** — Sheets API v4, A1 notation, batch updates

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add `GROQ_API_KEY` environment variable
4. Deploy

## License

MIT
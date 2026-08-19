import { Integration } from '@/types';

export const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing, subscriptions, and billing',
    systemPromptContext: `STRIPE INTEGRATION CONTEXT:
- Use Stripe Node.js SDK (stripe package)
- Key APIs: PaymentIntents, Customers, Subscriptions, Checkout Sessions, Webhooks
- Handle webhooks for async events (payment_intent.succeeded, invoice.payment_failed)
- Use idempotency keys for all mutating operations
- Store secret keys in environment variables, never in code
- Test with Stripe CLI and test card numbers (4242 4242 4242 4242)
- Implement proper error handling for card declines, insufficient funds, etc.`,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform for online stores',
    systemPromptContext: `SHOPIFY INTEGRATION CONTEXT:
- Use Shopify Admin API (GraphQL) or REST API
- Authentication: Private app tokens or OAuth for public apps
- Key resources: Products, Orders, Customers, Collections, Webhooks
- Use GraphQL for efficient queries (avoid over-fetching)
- Handle rate limits (2 requests/second for REST, cost-based for GraphQL)
- Webhooks for real-time updates (orders/create, products/update)
- Multicurrency and multi-language support available`,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email sending, reading, and management',
    systemPromptContext: `GMAIL INTEGRATION CONTEXT:
- Use Gmail API (Google APIs Node.js client)
- OAuth 2.0 required for user authorization
- Key operations: messages.send, messages.list, messages.get, labels
- Use drafts for composing, then send
- Handle pagination with nextPageToken
- Respect quotas: 250 units/user/second, 1B quota/day
- Use batch requests for multiple operations
- MIME format for rich emails with attachments`,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team messaging and workspace automation',
    systemPromptContext: `SLACK INTEGRATION CONTEXT:
- Use Slack Bolt SDK (@slack/bolt) or Web API (@slack/web-api)
- Bot token (xoxb-) for app-level actions, user token (xoxp-) for user actions
- Key methods: chat.postMessage, conversations.list, users.info, views.open
- Block Kit for rich message formatting (sections, buttons, inputs)
- Socket Mode for real-time events without public URL
- Handle rate limits: Tier 1 (1 req/sec), Tier 2 (20 req/sec), Tier 3 (50 req/sec)
- Use metadata for message updates, not chat.delete + chat.postMessage`,
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Spreadsheet reading, writing, and automation',
    systemPromptContext: `GOOGLE SHEETS INTEGRATION CONTEXT:
- Use Google Sheets API v4 (googleapis package)
- OAuth 2.0 or Service Account for authentication
- Key operations: spreadsheets.values.get, update, append, batchUpdate
- A1 notation for ranges (e.g., 'Sheet1!A1:C10')
- Use batchUpdate for multiple operations in one request
- Handle concurrent edits with conditional updates (ETags)
- Respect quotas: 500 requests/100 seconds/project
- Use named ranges for maintainable references`,
  },
];

export function getIntegrationById(id: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

export function getIntegrationsByIds(ids: string[]): Integration[] {
  return ids.map((id) => getIntegrationById(id)).filter((i): i is Integration => i !== undefined);
}
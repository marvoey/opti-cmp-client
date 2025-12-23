# @optimarvin/opti-cmp-client

Framework-agnostic client library for Optimizely CMP (Content Marketing Platform) preview webhook handling and API integration.

## Features

- **Framework Agnostic**: Works with any Node.js framework (Express, Next.js, Astro, Fastify, etc.)
- **OAuth Token Management**: Automatic token caching and refresh
- **Preview Webhook Handler**: Complete implementation of the CMP "Render Preview with Push Strategy" protocol
- **Full TypeScript Support**: Written in TypeScript with comprehensive type definitions
- **Modular Design**: Use individual components (OAuth client, API client, webhook handler) as needed

## Installation

```bash
npm install @optimarvin/opti-cmp-client
```

## Quick Start

### Webhook Handler (Simplest Approach)

The webhook handler provides a complete solution for processing CMP preview webhooks:

```typescript
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

const handler = new CMPWebhookHandler({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  authServerUrl: 'https://api.optimizely.com',
  apiBaseUrl: 'https://api.optimizely.com',
  previewUrl: 'https://preview.yoursite.com'
});

// In your webhook endpoint
const result = await handler.handleWebhook(requestBody);

if (result.success) {
  // Preview generated successfully
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

## API Reference

### CMPWebhookHandler

Complete webhook processing including acknowledgment, URL generation, and completion.

```typescript
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

const handler = new CMPWebhookHandler({
  clientId: string;
  clientSecret: string;
  authServerUrl: string;
  apiBaseUrl: string;
  previewUrl: string;
  previewTypes?: string[]; // Optional, defaults to ['default', 'mobile', 'desktop', 'tablet', 'signage']
});

// Process webhook
const result = await handler.handleWebhook(payload);
```

**Methods:**
- `handleWebhook(payload: string | CMPWebhookPayload)`: Process complete webhook workflow
- `parseWebhookPayload(payload: CMPWebhookPayload)`: Extract and validate webhook data
- `generatePreviewUrls(contentId: string)`: Generate preview URLs for all device types
- `getClient()`: Access the underlying CMPClient for direct API calls

### CMPClient

Direct access to CMP API methods.

```typescript
import { CMPClient } from '@optimarvin/opti-cmp-client';

const client = new CMPClient({
  clientId: string;
  clientSecret: string;
  authServerUrl: string;
  apiBaseUrl: string;
});

// Acknowledge a preview
await client.acknowledgePreview(contentId, versionId, previewId, acknowledgedBy, contentHash);

// Submit preview completion
await client.submitPreviewCompletion(contentId, versionId, previewId, keyedPreviews);

// Access OAuth client
const oauthClient = client.getOAuthClient();
```

### CMPOAuthClient

OAuth token management with automatic caching.

```typescript
import { CMPOAuthClient } from '@optimarvin/opti-cmp-client';

const oauthClient = new CMPOAuthClient({
  clientId: string;
  clientSecret: string;
  authServerUrl: string;
});

// Get access token (cached automatically)
const token = await oauthClient.getAccessToken();

// Check if token is cached
const hasCached = oauthClient.hasCachedToken();

// Clear cached token
oauthClient.clearCache();
```

## Framework Integration Examples

### Astro

```typescript
// src/pages/api/cmp-preview-webhook.ts
import type { APIRoute } from "astro";
import { CMPWebhookHandler } from "@optimarvin/opti-cmp-client";

const webhookHandler = new CMPWebhookHandler({
  clientId: import.meta.env.CMP_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.CMP_OAUTH_CLIENT_SECRET,
  authServerUrl: import.meta.env.CMP_AUTH_SERVER_URL,
  apiBaseUrl: import.meta.env.CMP_API_BASE_URL,
  previewUrl: import.meta.env.CMP_PREVIEW_URL
});

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  const result = await webhookHandler.handleWebhook(rawBody);

  return new Response(
    JSON.stringify(result.success ? result.data : { error: result.error }),
    {
      status: result.status,
      headers: { "Content-Type": "application/json" }
    }
  );
};
```

### Next.js (App Router)

```typescript
// app/api/cmp-preview-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

const webhookHandler = new CMPWebhookHandler({
  clientId: process.env.CMP_OAUTH_CLIENT_ID!,
  clientSecret: process.env.CMP_OAUTH_CLIENT_SECRET!,
  authServerUrl: process.env.CMP_AUTH_SERVER_URL!,
  apiBaseUrl: process.env.CMP_API_BASE_URL!,
  previewUrl: process.env.CMP_PREVIEW_URL!
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const result = await webhookHandler.handleWebhook(body);

  return NextResponse.json(
    result.success ? result.data : { error: result.error },
    { status: result.status }
  );
}
```

### Express

```javascript
import express from 'express';
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

const app = express();
app.use(express.text({ type: 'application/json' }));

const webhookHandler = new CMPWebhookHandler({
  clientId: process.env.CMP_OAUTH_CLIENT_ID,
  clientSecret: process.env.CMP_OAUTH_CLIENT_SECRET,
  authServerUrl: process.env.CMP_AUTH_SERVER_URL,
  apiBaseUrl: process.env.CMP_API_BASE_URL,
  previewUrl: process.env.CMP_PREVIEW_URL
});

app.post('/api/cmp-preview-webhook', async (req, res) => {
  const result = await webhookHandler.handleWebhook(req.body);
  res.status(result.status).json(result.success ? result.data : { error: result.error });
});
```

## Advanced Usage

### Custom Preview Types

Customize which preview types are generated:

```typescript
const handler = new CMPWebhookHandler({
  // ... other config
  previewTypes: ['default', 'mobile', 'desktop']
});
```

### Direct API Access

Use the client directly for custom workflows:

```typescript
import { CMPClient } from '@optimarvin/opti-cmp-client';

const client = new CMPClient({ /* config */ });

// Manual workflow
const payload = parseWebhookSomehow(request);
await client.acknowledgePreview(/* ... */);
const urls = generateUrlsSomehow();
await client.submitPreviewCompletion(/* ... */);
```

### OAuth Token Management

Access the OAuth client for custom API calls:

```typescript
const handler = new CMPWebhookHandler({ /* config */ });
const client = handler.getClient();
const oauthClient = client.getOAuthClient();

// Use token for custom API calls
const token = await oauthClient.getAccessToken();
const response = await fetch('https://api.optimizely.com/v3/...', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## CMP Preview Protocol

This library implements the complete "Render Preview with Push Strategy" protocol:

1. **Webhook Delivery**: CMP sends preview request webhook
2. **Acknowledgment**: Library acknowledges receipt and capability to handle the content type
3. **Preview Generation**: Library generates preview URLs for different device types
4. **Completion**: Library submits preview URLs back to CMP
5. **Cleanup**: (Not yet implemented) Clean up draft content after ~15 minutes

## Environment Variables

Required environment variables for your application:

```bash
CMP_OAUTH_CLIENT_ID=your-client-id
CMP_OAUTH_CLIENT_SECRET=your-client-secret
CMP_AUTH_SERVER_URL=https://api.optimizely.com
CMP_API_BASE_URL=https://api.optimizely.com
CMP_PREVIEW_URL=https://preview.yoursite.com
```

## Error Handling

The library throws `CMPError` for API-related errors:

```typescript
import { CMPError } from '@optimarvin/opti-cmp-client';

try {
  await handler.handleWebhook(payload);
} catch (error) {
  if (error instanceof CMPError) {
    console.error('CMP API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
  }
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  CMPWebhookConfig,
  CMPClientConfig,
  CMPOAuthConfig,
  CMPWebhookPayload,
  PreviewRequest,
  KeyedPreviews,
  WebhookHandlerResult
} from '@optimarvin/opti-cmp-client';
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

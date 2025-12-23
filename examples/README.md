# Examples

This directory contains example integrations for various frameworks.

## Available Examples

- **Astro** (`astro/cmp-preview-webhook.ts`) - Example for Astro framework
- **Express** (`express/webhook.js`) - Example for Express.js
- **Next.js** (`nextjs/route.ts`) - Example for Next.js App Router

## Usage

Each example demonstrates how to use `@optimarvin/opti-cmp-client` in a specific framework.

1. Copy the relevant example file to your project
2. Install the package: `npm install @optimarvin/opti-cmp-client`
3. Configure your environment variables
4. Adjust the example to match your project structure

## Environment Variables

All examples require these environment variables:

```bash
CMP_OAUTH_CLIENT_ID=your-client-id
CMP_OAUTH_CLIENT_SECRET=your-client-secret
CMP_AUTH_SERVER_URL=https://api.optimizely.com
CMP_API_BASE_URL=https://api.optimizely.com
CMP_PREVIEW_URL=https://preview.yoursite.com
```

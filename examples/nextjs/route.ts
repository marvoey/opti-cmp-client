/**
 * Example: Optimizely CMP Preview Webhook Handler for Next.js App Router
 *
 * This demonstrates how to use @optimarvin/opti-cmp-client with Next.js 13+ App Router
 *
 * File location: app/api/cmp-preview-webhook/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

// Initialize the webhook handler
const webhookHandler = new CMPWebhookHandler({
  clientId: process.env.CMP_OAUTH_CLIENT_ID!,
  clientSecret: process.env.CMP_OAUTH_CLIENT_SECRET!,
  authServerUrl: process.env.CMP_AUTH_SERVER_URL!,
  apiBaseUrl: process.env.CMP_API_BASE_URL!,
  previewUrl: process.env.CMP_PREVIEW_URL!
});

export async function POST(request: NextRequest) {
  console.log('Received CMP preview webhook request');

  try {
    // Get the request body as text
    const body = await request.text();

    // Process the webhook
    const result = await webhookHandler.handleWebhook(body);

    // Return response based on result
    if (result.success) {
      return NextResponse.json(
        {
          message: 'Webhook received, preview acknowledged and completed successfully',
          acknowledged: true,
          completed: true,
          ...result.data
        },
        { status: result.status }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

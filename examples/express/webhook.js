/**
 * Example: Optimizely CMP Preview Webhook Handler for Express
 *
 * This demonstrates how to use @optimarvin/opti-cmp-client with Express.js
 */

import express from 'express';
import { CMPWebhookHandler } from '@optimarvin/opti-cmp-client';

const app = express();

// Use raw body parser for webhook endpoint
app.use(express.text({ type: 'application/json' }));

// Initialize the webhook handler
const webhookHandler = new CMPWebhookHandler({
  clientId: process.env.CMP_OAUTH_CLIENT_ID,
  clientSecret: process.env.CMP_OAUTH_CLIENT_SECRET,
  authServerUrl: process.env.CMP_AUTH_SERVER_URL,
  apiBaseUrl: process.env.CMP_API_BASE_URL,
  previewUrl: process.env.CMP_PREVIEW_URL
});

// Webhook endpoint
app.post('/api/cmp-preview-webhook', async (req, res) => {
  console.log('Received CMP preview webhook request');

  try {
    // Process the webhook
    const result = await webhookHandler.handleWebhook(req.body);

    // Return response based on result
    if (result.success) {
      res.status(result.status).json({
        message: 'Webhook received, preview acknowledged and completed successfully',
        acknowledged: true,
        completed: true,
        ...result.data
      });
    } else {
      res.status(result.status).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

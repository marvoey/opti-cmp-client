import type { APIRoute } from "astro";
import { CMPWebhookHandler } from "@optimarvin/opti-cmp-client";

/**
 * Example: Optimizely CMP Preview Webhook Handler for Astro
 *
 * This demonstrates how to use @optimarvin/opti-cmp-client in an Astro project.
 */

// Initialize the webhook handler with configuration
const webhookHandler = new CMPWebhookHandler({
  clientId: import.meta.env.CMP_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.CMP_OAUTH_CLIENT_SECRET,
  authServerUrl: import.meta.env.CMP_AUTH_SERVER_URL,
  apiBaseUrl: import.meta.env.CMP_API_BASE_URL,
  previewUrl: import.meta.env.CMP_PREVIEW_URL,
  // Optional: customize preview types
  // previewTypes: ['default', 'mobile', 'desktop']
});

/**
 * POST endpoint handler for CMP webhooks
 */
export const POST: APIRoute = async ({ request }) => {
  console.log("Received CMP preview webhook request");

  try {
    // Get the raw body
    const rawBody = await request.text();

    // Process the webhook using the handler
    const result = await webhookHandler.handleWebhook(rawBody);

    // Return appropriate response
    if (result.success) {
      return new Response(
        JSON.stringify({
          message: "Webhook received, preview acknowledged and completed successfully",
          acknowledged: true,
          completed: true,
          ...result.data
        }),
        {
          status: result.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: result.error
        }),
        {
          status: result.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

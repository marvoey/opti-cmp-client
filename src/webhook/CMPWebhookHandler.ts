import type {
  CMPWebhookConfig,
  CMPWebhookPayload,
  PreviewRequest,
  KeyedPreviews,
  WebhookHandlerResult
} from '../types/index.js';
import { CMPError } from '../types/index.js';
import { CMPClient } from '../client/CMPClient.js';

/**
 * Handler for Optimizely CMP preview webhooks
 *
 * Implements the "Render Preview with Push Strategy" protocol:
 * 1. Receives webhook payload
 * 2. Acknowledges the preview request
 * 3. Generates preview URLs
 * 4. Submits completion to CMP
 */
export class CMPWebhookHandler {
  private client: CMPClient;
  private previewTypes: string[];

  constructor(private config: CMPWebhookConfig) {
    if (!config.previewUrl) {
      throw new Error('previewUrl is required');
    }

    this.client = new CMPClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authServerUrl: config.authServerUrl,
      apiBaseUrl: config.apiBaseUrl
    });

    this.previewTypes = config.previewTypes || [
      'default',
      'mobile',
      'desktop',
      'tablet',
      'signage'
    ];
  }

  /**
   * Get the CMP client instance
   *
   * Useful for direct API access beyond webhook handling
   */
  getClient(): CMPClient {
    return this.client;
  }

  /**
   * Parse and validate webhook payload
   *
   * Extracts required fields from the webhook payload and validates
   * that all necessary data is present.
   *
   * @param payload - Raw webhook payload
   * @returns Extracted preview request data
   * @throws CMPError if required fields are missing
   */
  parseWebhookPayload(payload: CMPWebhookPayload): PreviewRequest {
    const data = payload.data;
    const structuredContent = data?.assets?.structured_contents?.[0];

    const contentId = structuredContent?.id;
    const versionId = structuredContent?.version_id;
    const previewId = data?.preview_id;
    const updatedBy = structuredContent?.content_body?.updated_by;
    const contentHash = structuredContent?.content_body?.fields_version?.content_hash;

    if (!contentId || !versionId || !previewId || !updatedBy || !contentHash) {
      throw new CMPError(
        'Missing required fields in webhook payload',
        400,
        `contentId=${contentId}, versionId=${versionId}, previewId=${previewId}, updatedBy=${updatedBy}, contentHash=${contentHash}`
      );
    }

    return {
      contentId,
      versionId,
      previewId,
      updatedBy,
      contentHash
    };
  }

  /**
   * PROTOCOL STEP 3: Generate Preview URLs
   *
   * Creates preview URLs for different device types/channels.
   * Each preview URL points to the preview page with a unique identifier.
   *
   * @param contentId - The content ID to use in the preview URL
   * @returns Dictionary of preview types mapped to their URLs
   */
  generatePreviewUrls(contentId: string): KeyedPreviews {
    const keyedPreviews: KeyedPreviews = {};

    for (const type of this.previewTypes) {
      keyedPreviews[type] = `${this.config.previewUrl}/preview/${type}/${contentId}`;
    }

    return keyedPreviews;
  }

  /**
   * Handle a CMP preview webhook request
   *
   * Processes the complete preview workflow:
   * 1. Parse and validate the webhook payload
   * 2. Acknowledge the preview with CMP
   * 3. Generate preview URLs
   * 4. Submit completion to CMP
   *
   * @param payload - Webhook payload (can be string or object)
   * @returns Result object with success status and data or error
   */
  async handleWebhook(payload: string | CMPWebhookPayload): Promise<WebhookHandlerResult> {
    try {
      // Parse payload if it's a string
      let parsedPayload: CMPWebhookPayload;
      if (typeof payload === 'string') {
        if (!payload || payload.length === 0) {
          return {
            success: false,
            error: 'Empty payload',
            status: 400
          };
        }
        try {
          parsedPayload = JSON.parse(payload);
        } catch {
          return {
            success: false,
            error: 'Invalid JSON payload',
            status: 400
          };
        }
      } else {
        parsedPayload = payload;
      }

      // Extract and validate required fields
      const previewRequest = this.parseWebhookPayload(parsedPayload);

      // PROTOCOL STEP 2: Acknowledge the preview
      await this.client.acknowledgePreview(
        previewRequest.contentId,
        previewRequest.versionId,
        previewRequest.previewId,
        previewRequest.updatedBy,
        previewRequest.contentHash
      );

      // PROTOCOL STEP 3: Generate preview URLs
      const keyedPreviews = this.generatePreviewUrls(previewRequest.contentId);

      // PROTOCOL STEP 4: Submit completion
      await this.client.submitPreviewCompletion(
        previewRequest.contentId,
        previewRequest.versionId,
        previewRequest.previewId,
        keyedPreviews
      );

      return {
        success: true,
        data: {
          contentId: previewRequest.contentId,
          versionId: previewRequest.versionId,
          previewId: previewRequest.previewId,
          keyedPreviews
        },
        status: 200
      };
    } catch (error) {
      if (error instanceof CMPError) {
        return {
          success: false,
          error: error.message,
          status: error.statusCode || 500
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
}

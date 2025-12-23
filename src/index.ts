/**
 * @optimarvin/opti-cmp-client
 *
 * Framework-agnostic client library for Optimizely CMP preview webhook handling and API integration
 */

// Export main classes
export { CMPOAuthClient } from './oauth/CMPOAuthClient.js';
export { CMPClient } from './client/CMPClient.js';
export { CMPWebhookHandler } from './webhook/CMPWebhookHandler.js';

// Export types
export type {
  CMPOAuthConfig,
  CMPClientConfig,
  CMPWebhookConfig,
  TokenCache,
  TokenResponse,
  StructuredContent,
  CMPWebhookPayload,
  PreviewRequest,
  KeyedPreviews,
  WebhookHandlerResult
} from './types/index.js';

// Export error class
export { CMPError } from './types/index.js';

import type { CMPClientConfig, KeyedPreviews, CMPImage } from '../types/index.js';
import { CMPError } from '../types/index.js';
import { CMPOAuthClient } from '../oauth/CMPOAuthClient.js';

/**
 * Client for Optimizely CMP API
 *
 * Provides methods for interacting with the CMP API, including
 * preview-related operations like acknowledgment and completion.
 */
export class CMPClient {
  private oauthClient: CMPOAuthClient;

  constructor(private config: CMPClientConfig) {
    if (!config.apiBaseUrl) {
      throw new Error('apiBaseUrl is required');
    }

    this.oauthClient = new CMPOAuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authServerUrl: config.authServerUrl
    });
  }

  /**
   * Get the OAuth client instance
   *
   * Useful for advanced use cases where direct token access is needed
   */
  getOAuthClient(): CMPOAuthClient {
    return this.oauthClient;
  }

  /**
   * PROTOCOL STEP 2: Acknowledge Preview Request
   *
   * Sends an acknowledgment to CMP confirming that this preview generator:
   * 1. Has received the webhook request
   * 2. Can handle the specific content type
   * 3. Will process the preview generation
   *
   * The content_hash is critical - CMP uses it as a digest signature to determine
   * if previews have become outdated when content changes.
   *
   * @param contentId - The structured content ID from CMP
   * @param versionId - The content version ID
   * @param previewId - The unique preview request ID
   * @param acknowledgedBy - The user who triggered the preview
   * @param contentHash - Content hash for tracking changes
   */
  async acknowledgePreview(
    contentId: string,
    versionId: string,
    previewId: string,
    acknowledgedBy: string,
    contentHash: string
  ): Promise<void> {
    const acknowledgeUrl = `${this.config.apiBaseUrl}/structured-content/contents/${contentId}/versions/${versionId}/previews/${previewId}/acknowledge`;

    const accessToken = await this.oauthClient.getAccessToken();

    const response = await fetch(acknowledgeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        acknowledged_by: acknowledgedBy,
        content_hash: contentHash
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new CMPError(
        'Failed to acknowledge preview',
        response.status,
        errorText
      );
    }
  }

  /**
   * PROTOCOL STEP 4: Submit Completion
   *
   * Submits the generated preview URLs back to CMP, completing the preview generation workflow.
   * CMP will cache these URLs and present them to content editors for preview.
   *
   * @param contentId - The structured content ID from CMP
   * @param versionId - The content version ID
   * @param previewId - The unique preview request ID
   * @param keyedPreviews - Dictionary mapping preview types to URLs
   */
  async submitPreviewCompletion(
    contentId: string,
    versionId: string,
    previewId: string,
    keyedPreviews: KeyedPreviews
  ): Promise<void> {
    const completionUrl = `${this.config.apiBaseUrl}/structured-content/contents/${contentId}/versions/${versionId}/previews/${previewId}/complete`;

    const accessToken = await this.oauthClient.getAccessToken();

    const response = await fetch(completionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyed_previews: keyedPreviews
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new CMPError(
        'Failed to submit preview completion',
        response.status,
        errorText
      );
    }
  }

  /**
   * Get Image by ID
   *
   * Retrieves image metadata and URL from CMP by image ID.
   *
   * @param id - The image ID (e.g., from graph://cmp/ImageMedia/{id})
   * @returns The image data from CMP
   */
  async getImage(id: string): Promise<CMPImage> {
    const imageUrl = `${this.config.apiBaseUrl}/images/${id}`;

    const accessToken = await this.oauthClient.getAccessToken();

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new CMPError(
        `Failed to get image with ID: ${id}`,
        response.status,
        errorText
      );
    }

    return await response.json() as CMPImage;
  }
}

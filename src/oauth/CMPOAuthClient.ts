import type { CMPOAuthConfig, TokenCache, TokenResponse } from '../types/index.js';
import { CMPError } from '../types/index.js';

/**
 * OAuth client for Optimizely CMP API authentication
 *
 * Handles OAuth 2.0 client credentials flow with automatic token caching
 * and refresh before expiration.
 */
export class CMPOAuthClient {
  private tokenCache: TokenCache | null = null;

  constructor(private config: CMPOAuthConfig) {
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    if (!config.clientSecret) {
      throw new Error('clientSecret is required');
    }
    if (!config.authServerUrl) {
      throw new Error('authServerUrl is required');
    }
  }

  /**
   * Get a valid OAuth access token
   *
   * Returns cached token if still valid, otherwise fetches a new one.
   * Tokens are cached with a 5-minute buffer before expiration.
   *
   * @returns A valid OAuth access token
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    // Fetch new token
    const tokenUrl = `${this.config.authServerUrl}/o/oauth2/v1/token`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new CMPError(
        'Failed to obtain access token',
        response.status,
        errorText
      );
    }

    const data = await response.json() as TokenResponse;

    if (!data.access_token || !data.expires_in) {
      throw new CMPError('Invalid token response: missing access_token or expires_in');
    }

    // Cache the token with 5-minute (300 seconds) buffer before expiration
    const expiresInMs = (data.expires_in - 300) * 1000;
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + expiresInMs
    };

    return data.access_token;
  }

  /**
   * Clear the cached token
   *
   * Forces a new token to be fetched on the next getAccessToken() call
   */
  clearCache(): void {
    this.tokenCache = null;
  }

  /**
   * Check if a token is currently cached and valid
   */
  hasCachedToken(): boolean {
    return this.tokenCache !== null && Date.now() < this.tokenCache.expiresAt;
  }
}

/**
 * Configuration options for the CMP OAuth client
 */
export interface CMPOAuthConfig {
  /** CMP OAuth client ID */
  clientId: string;
  /** CMP OAuth client secret */
  clientSecret: string;
  /** CMP Auth server URL (e.g., https://api.optimizely.com) */
  authServerUrl: string;
}

/**
 * Configuration options for the CMP API client
 */
export interface CMPClientConfig extends CMPOAuthConfig {
  /** CMP API base URL (e.g., https://api.optimizely.com) */
  apiBaseUrl: string;
}

/**
 * Configuration options for the CMP webhook handler
 */
export interface CMPWebhookConfig extends CMPClientConfig {
  /** Base URL for preview pages (e.g., https://preview.example.com) */
  previewUrl: string;
  /** Optional: Preview types to generate (defaults to ['default', 'mobile', 'desktop', 'tablet', 'signage']) */
  previewTypes?: string[];
}

/**
 * OAuth token cache entry
 */
export interface TokenCache {
  /** OAuth access token */
  accessToken: string;
  /** Expiration timestamp in milliseconds */
  expiresAt: number;
}

/**
 * OAuth token response from CMP
 */
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Structured content data from CMP webhook
 */
export interface StructuredContent {
  id: string;
  version_id: string;
  content_body: {
    updated_by: string;
    fields_version: {
      content_hash: string;
    };
    fields: Record<string, unknown>;
  };
}

/**
 * CMP webhook payload structure
 */
export interface CMPWebhookPayload {
  data: {
    preview_id: string;
    assets: {
      structured_contents: StructuredContent[];
    };
  };
}

/**
 * Extracted preview request data
 */
export interface PreviewRequest {
  /** Content ID */
  contentId: string;
  /** Content version ID */
  versionId: string;
  /** Preview request ID */
  previewId: string;
  /** User who triggered the preview */
  updatedBy: string;
  /** Content hash for tracking changes */
  contentHash: string;
}

/**
 * Preview URLs mapped by type
 */
export interface KeyedPreviews {
  [previewType: string]: string;
}

/**
 * Webhook handler result
 */
export interface WebhookHandlerResult {
  /** Whether the webhook was processed successfully */
  success: boolean;
  /** Preview request data (if successful) */
  data?: {
    contentId: string;
    versionId: string;
    previewId: string;
    keyedPreviews: KeyedPreviews;
  };
  /** Error message (if failed) */
  error?: string;
  /** HTTP status code */
  status: number;
}

/**
 * Image resolution dimensions
 */
export interface ImageResolution {
  /** Height in pixels */
  height: number;
  /** Width in pixels */
  width: number;
}

/**
 * Focal point for image cropping
 */
export interface FocalPoint {
  /** X coordinate (0-1) */
  x: number;
  /** Y coordinate (0-1) */
  y: number;
}

/**
 * CMP Image response structure
 */
export interface CMPImage {
  /** Unique image identifier */
  id: string;
  /** Image title */
  title: string;
  /** MIME type (e.g., image/png, image/jpeg) */
  mime_type: string;
  /** ISO 8601 timestamp when image was created */
  created_at: string;
  /** ISO 8601 timestamp when image was last modified */
  modified_at: string;
  /** File size in bytes */
  file_size: number;
  /** Image dimensions */
  image_resolution: ImageResolution;
  /** Full URL to the image */
  url: string;
  /** Labels associated with the image */
  labels: string[];
  /** Image description (optional) */
  description: string | null;
  /** Focal point for smart cropping (optional) */
  focal_point: FocalPoint | null;
  /** Folder ID where image is stored (optional) */
  folder_id: string | null;
  /** File location path */
  file_location: string;
  /** File extension without the dot */
  file_extension: string;
  /** Whether the image is archived */
  is_archived: boolean;
  /** Whether the image is publicly accessible */
  is_public: boolean;
  /** Organization ID that owns the image */
  owner_organization_id: string;
  /** ISO 8601 timestamp when image expires (optional) */
  expires_at: string | null;
  /** Thumbnail URL */
  thumbnail_url: string;
  /** Version number */
  version_number: number;
  /** Version identifier */
  version_id: string;
  /** Alt text for accessibility (optional) */
  alt_text: string | null;
  /** Tags associated with the image */
  tags: string[];
  /** Attribution text (optional) */
  attribution_text: string | null;
  /** User ID of the owner */
  owner_id: string;
}

/**
 * Error class for CMP API errors
 */
export class CMPError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'CMPError';
  }
}

export interface VeniceAPIError {
  error?: {
    message?: string;
  };
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatCompletionResponse extends VeniceAPIError {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface ImageGenerationResponse extends VeniceAPIError {
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

export interface ImageUpscaleResponse extends VeniceAPIError {
  data?: {
    url?: string;
  };
}

export interface EmbeddingsResponse extends VeniceAPIError {
  data?: Array<{
    embedding?: number[];
  }>;
}

export interface Model {
  id?: string;
  type?: string;
  object?: string;
}

export interface ModelsResponse extends VeniceAPIError {
  data?: Model[];
}

export interface Character {
  id?: string;
  name?: string;
  description?: string;
  slug?: string;
}

export interface CharactersResponse extends VeniceAPIError {
  data?: Character[];
}

export interface APIKey {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
  lastUsedAt?: string;
  last_used_at?: string;
  apiKeyType?: string;
}

export interface APIKeysResponse extends VeniceAPIError {
  data?: APIKey[];
}

export interface CreateAPIKeyResponse extends VeniceAPIError {
  data?: {
    id?: string;
    apiKey?: string;
    key?: string;
    name?: string;
    description?: string;
  };
  success?: boolean;
}

export interface RateLimitsResponse extends VeniceAPIError {
  data?: Record<string, unknown>;
}

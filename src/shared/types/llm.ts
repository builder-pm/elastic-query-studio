export interface LLMConfiguration {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retryAttempts: number;
}

export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  apiEndpoint: string;
  authType: 'api_key' | 'bearer_token' | 'none';
  defaultConfig: Partial<LLMConfiguration>;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  supportedFeatures: string[];
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

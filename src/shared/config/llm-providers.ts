import { LLMProvider } from '../types/llm';

export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  // Example for Gemini - this would be filled out more completely
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'], // Example models
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta', // Example endpoint
    authType: 'api_key',
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 2048,
    },
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 1000000,
    },
    supportedFeatures: ['json_mode', 'system_prompt'],
  },
  // Add other providers like openai, anthropic, ollama as basic structures
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    apiEndpoint: 'https://api.openai.com/v1',
    authType: 'api_key',
    defaultConfig: {},
    rateLimits: { requestsPerMinute: 60, tokensPerMinute: 150000 },
    supportedFeatures: [],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    apiEndpoint: 'https://api.anthropic.com/v1',
    authType: 'api_key',
    defaultConfig: {},
    rateLimits: { requestsPerMinute: 60, tokensPerMinute: 200000 },
    supportedFeatures: [],
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [], // User would typically list their downloaded models
    apiEndpoint: 'http://localhost:11434/api', // Default local endpoint
    authType: 'none',
    defaultConfig: {},
    rateLimits: { requestsPerMinute: 0, tokensPerMinute: 0 }, // N/A for local typically
    supportedFeatures: [],
  }
};

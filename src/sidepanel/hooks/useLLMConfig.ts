import { useStorage } from './useStorage';
import { LLMConfiguration } from '../../shared/types/llm';

const DEFAULT_LLM_CONFIG: LLMConfiguration = {
  provider: 'gemini', // Or any other default provider
  model: 'gemini-1.5-pro-latest', // Or a default model for that provider
  apiKey: '',
  baseUrl: '',
  temperature: 0.7,
  maxTokens: 1024,
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
};

export const useLLMConfig = () => {
  const [llmConfig, setLLMConfig, isLoading, error] = useStorage<string, LLMConfiguration>(
    'llmConfig', 
    DEFAULT_LLM_CONFIG
  );

  // Potentially add functions here to update specific parts of the config,
  // or validate the config before saving.

  return { llmConfig, setLLMConfig, isLoadingConfig: isLoading, configError: error };
};

export default useLLMConfig;

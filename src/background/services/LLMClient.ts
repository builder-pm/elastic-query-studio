import { LLMConfiguration, LLMProvider, LLMResponse } from '../../shared/types/llm';
import { LLM_PROVIDERS } from '../../shared/config/llm-providers';


export class LLMClient {
  private config: LLMConfiguration;
  private provider: LLMProvider;

  constructor(config: LLMConfiguration) {
    this.config = config;
    this.provider = LLM_PROVIDERS[config.provider];
    
    if (!this.provider) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      let response: LLMResponse;
      
      switch (this.config.provider) {
        case 'gemini':
          response = await this.callGeminiAPI(prompt, systemPrompt);
          break;
        case 'openai':
          response = await this.callOpenAIAPI(prompt, systemPrompt);
          break;
        case 'anthropic':
          response = await this.callAnthropicAPI(prompt, systemPrompt);
          break;
        case 'ollama':
          response = await this.callOllamaAPI(prompt, systemPrompt);
          break;
        default:
          throw new Error(`Provider ${this.config.provider} not implemented`);
      }
      
      console.log(`LLM call completed in ${Date.now() - startTime}ms`);
      return response.content;
      
    } catch (error: any) {
      console.error('LLM call failed:', error);
      throw new Error(`LLM API error: ${error.message}`);
    }
  }

  private async callGeminiAPI(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const url = `${this.provider.apiEndpoint}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: systemPrompt ? `${systemPrompt}\\n\\nUser: ${prompt}` : prompt
        }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens
      }
    };

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    return {
      content: data.candidates[0].content.parts[0].text,
      model: this.config.model,
      finishReason: data.candidates[0].finishReason || 'stop'
    };
  }

  private async callOpenAIAPI(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const url = `${this.provider.apiEndpoint}/chat/completions`;
    
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0].finish_reason
    };
  }

  private async callAnthropicAPI(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const url = `${this.provider.apiEndpoint}/messages`;
    
    const body = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    };

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model,
      finishReason: data.stop_reason
    };
  }

  private async callOllamaAPI(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'http://localhost:11434'}/api/generate`;
    
    const body = {
      model: this.config.model,
      prompt: systemPrompt ? `${systemPrompt}\\n\\nUser: ${prompt}` : prompt,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens
      }
    };

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.response,
      model: data.model,
      finishReason: data.done ? 'stop' : 'length'
    };
  }

  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.generateCompletion('Test connection', 'Respond with "OK"');
      return testResponse === "OK";
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

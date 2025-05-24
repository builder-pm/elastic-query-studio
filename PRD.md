# Elasticsearch Query Helper AI Chrome Extension - Complete Development Specification

## Project Overview

### Product Description
A Chrome extension that converts natural language queries into accurate Elasticsearch DSL queries using a sophisticated multi-agent AI architecture. The system processes user input through specialized AI agents to generate, validate, and optimize Elasticsearch queries for a jobs index.

### Technical Goals
- **Query Accuracy**: Generate syntactically valid Elasticsearch 7.x queries with >85% success rate
- **Response Time**: Complete query generation within 15-45 seconds
- **User Experience**: Intuitive chat interface with multiple query options and debug capabilities
- **Provider Support**: Multi-LLM provider integration with failover capabilities

---

## Technical Architecture

### System Overview
```
User Input → Intent Parser → Perspective Agent → Query Builder → Validation Agent → Consensus Agent → UI Display
                ↓
        Sample Query Database → Enhanced Context for All Agents
                ↓
        Multi-Provider LLM System → Gemini/OpenAI/Anthropic/Ollama
```

### Core Components
1. **Multi-Agent Processing System**: 5 specialized AI agents working in sequence
2. **Sample Query Database**: 100+ curated Elasticsearch query examples
3. **Multi-Provider LLM Integration**: Support for 4 major LLM providers
4. **Chrome Extension Infrastructure**: Manifest V3 with side panel interface
5. **Caching Layer**: Multi-level caching for performance optimization

---

## File Structure and Setup

### Complete Project Structure
```
elasticsearch-query-helper/
├── manifest.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── src/
│   ├── background/
│   │   ├── background.ts
│   │   ├── agents/
│   │   │   ├── IntentParserAgent.ts
│   │   │   ├── PerspectiveAgent.ts
│   │   │   ├── QueryBuilderAgent.ts
│   │   │   ├── ValidationAgent.ts
│   │   │   ├── ConsensusAgent.ts
│   │   │   └── AgentOrchestrator.ts
│   │   └── services/
│   │       ├── LLMClient.ts
│   │       ├── CacheManager.ts
│   │       └── StorageManager.ts
│   ├── sidepanel/
│   │   ├── index.html
│   │   ├── sidepanel.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── QueryDisplay.tsx
│   │   │   ├── QueryOptionCard.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── DebugPanel.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── hooks/
│   │       ├── useStorage.ts
│   │       ├── useLLMConfig.ts
│   │       └── useDebugMode.ts
│   ├── shared/
│   │   ├── types/
│   │   │   ├── agents.ts
│   │   │   ├── elasticsearch.ts
│   │   │   ├── llm.ts
│   │   │   └── ui.ts
│   │   ├── config/
│   │   │   ├── llm-providers.ts
│   │   │   ├── elasticsearch-schema.ts
│   │   │   └── constants.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       ├── query-builder.ts
│   │       └── error-handling.ts
│   └── data/
│       ├── sample-queries.json
│       ├── jobs-index-schema.json
│       └── prompt-templates.json
├── tests/
│   ├── agents/
│   │   ├── IntentParserAgent.test.ts
│   │   ├── QueryBuilderAgent.test.ts
│   │   └── ValidationAgent.test.ts
│   ├── components/
│   │   ├── ChatInterface.test.tsx
│   │   └── QueryOptionCard.test.tsx
│   └── integration/
│       └── end-to-end.test.ts
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── TROUBLESHOOTING.md
```

### Configuration Files

#### package.json
```
{
  "name": "elasticsearch-query-helper",
  "version": "1.0.0",
  "description": "AI-powered Elasticsearch query generation Chrome extension",
  "scripts": {
    "dev": "vite build --watch --mode development",
    "build": "vite build --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.{ts,tsx}",
    "type-check": "tsc --noEmit",
    "package": "npm run build && zip -r elasticsearch-query-helper.zip dist manifest.json",
    "clean": "rm -rf dist && rm -f *.zip"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.254",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/jest": "^29.5.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

#### manifest.json
```
{
  "manifest_version": 3,
  "name": "Elasticsearch Query Helper AI",
  "version": "1.0.0",
  "description": "AI-powered Elasticsearch query generation with multi-agent intelligence",
  "permissions": [
    "storage",
    "sidePanel"
  ],
  "host_permissions": [
    "https://generativelanguage.googleapis.com/*",
    "https://api.openai.com/*",
    "https://api.anthropic.com/*",
    "http://localhost:*"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Open Elasticsearch Query Helper",
    "default_popup": ""
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com http://localhost:*"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

#### tsconfig.json
```
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["chrome", "jest", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### vite.config.ts
```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.ts'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})
```

---

## TypeScript Interfaces and Types

### src/shared/types/agents.ts
```
export interface ParsedIntent {
  entities: {
    companies: string[];
    locations: string[];
    skills: string[];
    jobTitles: string[];
    dateRanges: DateRange[];
    salaryRanges: SalaryRange[];
  };
  analysisType: 'search' | 'aggregation' | 'analytics';
  complexity: 'simple' | 'medium' | 'complex';
  confidence: number;
  rawInput: string;
}

export interface DateRange {
  gte?: string;
  lte?: string;
  gt?: string;
  lt?: string;
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface QueryPerspective {
  id: string;
  name: string;
  description: string;
  approach: 'exact_match' | 'fuzzy_search' | 'analytics' | 'trend_analysis';
  reasoning: string;
  confidence: number;
  estimatedComplexity: number;
}

export interface QueryResult {
  query: ESQuery;
  perspective: QueryPerspective;
  validation: ValidationResult;
  reasoning: string;
  complexity: number;
  estimatedPerformance: PerformanceMetrics;
  agentLogs: AgentLog[];
}

export interface ValidationResult {
  isValid: boolean;
  syntaxErrors: string[];
  schemaErrors: string[];
  performanceWarnings: string[];
  securityIssues: string[];
  score: number;
  recommendations: string[];
}

export interface PerformanceMetrics {
  executionTime?: number;
  memoryUsage?: number;
  complexityScore: number;
  optimizationSuggestions: string[];
}

export interface AgentLog {
  timestamp: Date;
  agent: string;
  action: string;
  input: any;
  output: any;
  duration: number;
  success: boolean;
  error?: string;
}

export interface AgentContext {
  userInput: string;
  parsedIntent?: ParsedIntent;
  schema: ElasticsearchSchema;
  sampleQueries: SampleQuery[];
  config: LLMConfiguration;
  debugMode: boolean;
  sessionId: string;
}
```

### src/shared/types/elasticsearch.ts
```
export interface ESQuery {
  query: any;
  size?: number;
  from?: number;
  _source?: string[] | boolean;
  aggs?: any;
  sort?: any[];
  track_total_hits?: boolean;
  timeout?: string;
}

export interface ElasticsearchSchema {
  mappings: {
    properties: Record;
  };
  version: string;
  lastUpdated: Date;
  indexName: string;
}

export interface FieldMapping {
  type: 'text' | 'keyword' | 'long' | 'integer' | 'date' | 'boolean' | 'geo_point' | 'nested' | 'object';
  fields?: Record;
  properties?: Record;
  analyzer?: string;
  format?: string;
}

export interface SampleQuery {
  id: string;
  description: string;
  userIntent: string;
  query: ESQuery;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex';
  successRate: number;
  businessContext?: string;
  performanceNotes?: string;
}
```

### src/shared/types/llm.ts
```
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
  defaultConfig: Partial;
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
```

### src/shared/types/ui.ts
```
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'debug' | 'system';
  content: string;
  timestamp: Date;
  queryResults?: QueryResult[];
  metadata?: Record;
}

export interface UIState {
  isLoading: boolean;
  currentQuery: string;
  messages: ChatMessage[];
  selectedProvider: string;
  debugMode: boolean;
  settingsOpen: boolean;
  theme: 'light' | 'dark';
}

export interface DebugInfo {
  agentLogs: AgentLog[];
  performanceMetrics: PerformanceMetrics;
  cacheHits: Record;
  errorDetails?: string;
}
```

---

## Core Implementation Files

### src/background/services/LLMClient.ts
```
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

  async generateCompletion(prompt: string, systemPrompt?: string): Promise {
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
      
    } catch (error) {
      console.error('LLM call failed:', error);
      throw new Error(`LLM API error: ${error.message}`);
    }
  }

  private async callGeminiAPI(prompt: string, systemPrompt?: string): Promise {
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates || !data.candidates.content) {
      throw new Error('Invalid response format from Gemini API');
    }

    return {
      content: data.candidates.content.parts.text,
      model: this.config.model,
      finishReason: data.candidates.finishReason || 'stop'
    };
  }

  private async callOpenAIAPI(prompt: string, systemPrompt?: string): Promise {
    const url = `${this.provider.apiEndpoint}/chat/completions`;
    
    const messages = [];
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
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices.message.content,
      usage: data.usage,
      model: data.model,
      finishReason: data.choices.finish_reason
    };
  }

  private async callAnthropicAPI(prompt: string, systemPrompt?: string): Promise {
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
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content.text,
      usage: data.usage,
      model: data.model,
      finishReason: data.stop_reason
    };
  }

  private async callOllamaAPI(prompt: string, systemPrompt?: string): Promise {
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
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.response,
      model: data.model,
      finishReason: data.done ? 'stop' : 'length'
    };
  }

  private async makeRequest(url: string, options: RequestInit): Promise {
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

  async testConnection(): Promise {
    try {
      await this.generateCompletion('Test connection', 'Respond with \"OK\"');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
```

### src/background/agents/IntentParserAgent.ts
```
import { LLMClient } from '../services/LLMClient';
import { ParsedIntent, AgentContext, AgentLog } from '../../shared/types/agents';

export class IntentParserAgent {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async parse(userInput: string, context: AgentContext): Promise {
    const startTime = Date.now();
    const log: AgentLog = {
      timestamp: new Date(),
      agent: 'IntentParser',
      action: 'parse',
      input: { userInput },
      output: null,
      duration: 0,
      success: false
    };

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(userInput, context.sampleQueries);
      
      const response = await this.llmClient.generateCompletion(userPrompt, systemPrompt);
      
      const parsed = JSON.parse(response);
      const validated = this.validateAndNormalize(parsed, userInput);
      
      log.output = validated;
      log.success = true;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode) {
        context.agentLogs?.push(log);
      }
      
      return validated;
      
    } catch (error) {
      log.error = error.message;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode) {
        context.agentLogs?.push(log);
      }
      
      throw new Error(`Intent parsing failed: ${error.message}`);
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    return `You are an expert Elasticsearch intent parser for a jobs index.

JOBS INDEX SCHEMA:
${JSON.stringify(context.schema.mappings.properties, null, 2)}

Your task is to extract structured information from user queries and return JSON in this exact format:
{
  "entities": {
    "companies": ["extracted company names"],
    "locations": ["extracted locations"],
    "skills": ["extracted skills/technologies"],
    "jobTitles": ["extracted job titles"],
    "dateRanges": [{"gte": "date", "lte": "date"}],
    "salaryRanges": [{"min": number, "max": number}]
  },
  "analysisType": "search|aggregation|analytics",
  "complexity": "simple|medium|complex",
  "confidence": 0.95
}

EXTRACTION RULES:
- Extract only entities that can be mapped to schema fields
- Normalize company names to common formats (Google vs Alphabet Inc.)
- Convert location references to standardized forms
- Identify programming languages, frameworks, and technical skills
- Parse relative dates (e.g., "last 30 days" → specific date range using now-30d format)
- Extract salary information when mentioned
- Classify complexity: simple (1-2 criteria), medium (3-4 criteria), complex (5+ criteria or aggregations)
- Set confidence based on clarity of user intent

RESPONSE: Return only valid JSON, no explanations.`;
  }

  private buildUserPrompt(userInput: string, sampleQueries: any[]): string {
    const relevantExamples = this.findRelevantExamples(userInput, sampleQueries, 3);
    
    return `USER QUERY: \"${userInput}\"

RELEVANT EXAMPLE PATTERNS:
${relevantExamples.map(ex => `
- Intent: ${ex.userIntent}
- Entities found: ${ex.tags.join(', ')}
- Complexity: ${ex.complexity}
`).join('\\n')}

Extract structured intent from the user query:`;
  }

  private findRelevantExamples(userInput: string, samples: any[], limit: number): any[] {
    const keywords = userInput.toLowerCase().split(/\\s+/);
    
    const scored = samples.map(sample => {
      const sampleText = `${sample.description} ${sample.userIntent} ${sample.tags.join(' ')}`.toLowerCase();
      
      const score = keywords.reduce((acc, keyword) => {
        return acc + (sampleText.includes(keyword) ? 1 : 0);
      }, 0);
      
      return { sample, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.sample);
  }

  private validateAndNormalize(parsed: any, originalInput: string): ParsedIntent {
    // Input validation and normalization
    const normalized: ParsedIntent = {
      entities: {
        companies: Array.isArray(parsed.entities?.companies) ? parsed.entities.companies : [],
        locations: Array.isArray(parsed.entities?.locations) ? parsed.entities.locations : [],
        skills: Array.isArray(parsed.entities?.skills) ? parsed.entities.skills : [],
        jobTitles: Array.isArray(parsed.entities?.jobTitles) ? parsed.entities.jobTitles : [],
        dateRanges: Array.isArray(parsed.entities?.dateRanges) ? parsed.entities.dateRanges : [],
        salaryRanges: Array.isArray(parsed.entities?.salaryRanges) ? parsed.entities.salaryRanges : []
      },
      analysisType: ['search', 'aggregation', 'analytics'].includes(parsed.analysisType) 
        ? parsed.analysisType : 'search',
      complexity: ['simple', 'medium', 'complex'].includes(parsed.complexity) 
        ? parsed.complexity : 'simple',
      confidence: typeof parsed.confidence === 'number' 
        ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      rawInput: originalInput
    };

    // Additional normalization
    normalized.entities.companies = normalized.entities.companies.map(this.normalizeCompanyName);
    normalized.entities.skills = normalized.entities.skills.map(this.normalizeSkillName);

    return normalized;
  }

  private normalizeCompanyName(company: string): string {
    const normalizations: Record = {
      'alphabet': 'Alphabet Inc.',
      'google': 'Google',
      'microsoft': 'Microsoft',
      'apple': 'Apple Inc.',
      'amazon': 'Amazon',
      'meta': 'Meta',
      'facebook': 'Meta'
    };
    
    return normalizations[company.toLowerCase()] || company;
  }

  private normalizeSkillName(skill: string): string {
    const normalizations: Record = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'nodejs': 'Node.js',
      'reactjs': 'React'
    };
    
    return normalizations[skill.toLowerCase()] || skill;
  }
}
```

### src/background/agents/QueryBuilderAgent.ts
```
import { LLMClient } from '../services/LLMClient';
import { ParsedIntent, QueryPerspective, AgentContext, ESQuery, AgentLog } from '../../shared/types/agents';

export class QueryBuilderAgent {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async buildQuery(
    intent: ParsedIntent, 
    perspective: QueryPerspective, 
    context: AgentContext
  ): Promise {
    const startTime = Date.now();
    const log: AgentLog = {
      timestamp: new Date(),
      agent: 'QueryBuilder',
      action: 'buildQuery',
      input: { intent, perspective },
      output: null,
      duration: 0,
      success: false
    };

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(intent, perspective, context.sampleQueries);
      
      const response = await this.llmClient.generateCompletion(userPrompt, systemPrompt);
      
      let query: ESQuery;
      try {
        query = JSON.parse(response);
      } catch (parseError) {
        // Try to extract JSON from response if it contains additional text
        const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) {
          query = JSON.parse(jsonMatch);
        } else {
          throw new Error('Invalid JSON in LLM response');
        }
      }
      
      const enhancedQuery = this.enforceStandardFilters(query);
      const optimizedQuery = this.optimizeQuery(enhancedQuery, intent);
      
      log.output = optimizedQuery;
      log.success = true;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode) {
        context.agentLogs?.push(log);
      }
      
      return optimizedQuery;
      
    } catch (error) {
      log.error = error.message;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode) {
        context.agentLogs?.push(log);
      }
      
      throw new Error(`Query building failed: ${error.message}`);
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    return `You are an expert Elasticsearch Query Builder for jobs data.

JOBS INDEX SCHEMA:
${JSON.stringify(context.schema.mappings.properties, null, 2)}

MANDATORY REQUIREMENTS:
1. Always include: {\"term\": {\"is_deleted.keyword\": \"0\"}}
2. Always include: {\"term\": {\"is_duplicate\": false}} 
3. Use .keyword fields for exact matching and aggregations
4. Use analyzed fields for full-text search
5. Prefer filters over queries for performance
6. Include appropriate date range filters

FIELD USAGE PATTERNS:
- job_title: Use both analyzed and .keyword versions
- company_name: Prefer .keyword for exact matches, analyzed for fuzzy
- location: Use analyzed for fuzzy matching, .keyword for exact
- standardized_geo_point: For geo-distance queries
- crawled_date/posted_date: For time-based filtering
- job_description: For skills and requirements matching
- raw_salary: For salary-based filtering
- skills.name: For technical skills matching

QUERY OPTIMIZATION:
- Use term queries for exact matches
- Use match queries for full-text search
- Use filters in bool context when possible
- Combine must/should/filter appropriately
- Limit aggregation sizes to reasonable values
- Use _source filtering to reduce payload size

RESPONSE FORMAT:
Return only valid Elasticsearch 7.x JSON query. No explanations or additional text.

PERFORMANCE CONSIDERATIONS:
- Avoid script queries
- Limit wildcard usage
- Use appropriate field types (.keyword vs analyzed)
- Set reasonable size limits
- Include timeout parameters for complex queries`;
  }

  private buildUserPrompt(
    intent: ParsedIntent, 
    perspective: QueryPerspective, 
    samples: any[]
  ): string {
    const relevantQueries = this.findSimilarQueries(intent, perspective, samples, 3);
    
    return `BUILD ELASTICSEARCH QUERY:

USER INTENT:
${JSON.stringify(intent, null, 2)}

PERSPECTIVE: ${perspective.name}
Approach: ${perspective.approach}
Description: ${perspective.description}
Reasoning: ${perspective.reasoning}

SIMILAR SUCCESSFUL QUERIES:
${relevantQueries.map(q => `
Example: ${q.description}
Intent: ${q.userIntent}
Query Structure:
${JSON.stringify(q.query, null, 2)}
Performance Notes: ${q.performanceNotes || 'Good performance'}
`).join('\\n')}

Generate the optimized Elasticsearch query based on the intent and perspective:`;
  }

  private findSimilarQueries(
    intent: ParsedIntent, 
    perspective: QueryPerspective, 
    samples: any[], 
    limit: number
  ): any[] {
    const scored = samples.map(sample => {
      let score = 0;
      
      // Entity-based scoring
      if (intent.entities.companies.length > 0 && sample.tags.includes('company')) score += 3;
      if (intent.entities.locations.length > 0 && sample.tags.includes('location')) score += 3;
      if (intent.entities.skills.length > 0 && sample.tags.includes('skills')) score += 3;
      if (intent.entities.jobTitles.length > 0 && sample.tags.includes('job_title')) score += 3;
      if (intent.entities.dateRanges.length > 0 && sample.tags.includes('date_range')) score += 2;
      if (intent.entities.salaryRanges.length > 0 && sample.tags.includes('salary')) score += 2;
      
      // Analysis type scoring
      if (intent.analysisType === 'aggregation' && sample.tags.includes('aggregation')) score += 5;
      if (intent.analysisType === 'search' && sample.tags.includes('search')) score += 2;
      if (intent.analysisType === 'analytics' && sample.tags.includes('analytics')) score += 4;
      
      // Complexity matching
      if (intent.complexity === sample.complexity) score += 2;
      
      // Perspective approach alignment
      if (perspective.approach === 'exact_match' && sample.tags.includes('exact_match')) score += 3;
      if (perspective.approach === 'fuzzy_search' && sample.tags.includes('fuzzy')) score += 3;
      if (perspective.approach === 'analytics' && sample.tags.includes('aggregation')) score += 3;
      
      return { sample, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.sample);
  }

  private enforceStandardFilters(query: ESQuery): ESQuery {
    // Ensure mandatory filters are always present
    if (!query.query) {
      query.query = { match_all: {} };
    }
    
    // Initialize bool query structure
    let boolQuery = {
      bool: {
        must: [] as any[],
        filter: [
          { term: { 'is_deleted.keyword': '0' } },
          { term: { 'is_duplicate': false } }
        ] as any[],
        should: [] as any[],
        must_not: [] as any[]
      }
    };

    // Merge existing query structure
    if (query.query.bool) {
      boolQuery.bool.must = query.query.bool.must || [];
      boolQuery.bool.should = query.query.bool.should || [];
      boolQuery.bool.must_not = query.query.bool.must_not || [];
      
      // Merge filters, avoiding duplicates
      const existingFilters = query.query.bool.filter || [];
      const mandatoryFilters = boolQuery.bool.filter;
      
      boolQuery.bool.filter = [
        ...mandatoryFilters,
        ...existingFilters.filter(f => 
          !mandatoryFilters.some(mf => JSON.stringify(mf) === JSON.stringify(f))
        )
      ];
      
      // Copy other bool properties
      if (query.query.bool.minimum_should_match !== undefined) {
        boolQuery.bool.minimum_should_match = query.query.bool.minimum_should_match;
      }
    } else {
      // Wrap non-bool query in must clause
      boolQuery.bool.must.push(query.query);
    }

    return {
      ...query,
      query: boolQuery
    };
  }

  private optimizeQuery(query: ESQuery, intent: ParsedIntent): ESQuery {
    // Add default optimizations
    const optimized = { ...query };
    
    // Set reasonable defaults if not specified
    if (!optimized.size && intent.analysisType !== 'aggregation') {
      optimized.size = 50; // Default result size
    }
    
    // Add timeout for complex queries
    if (intent.complexity === 'complex' && !optimized.timeout) {
      optimized.timeout = '30s';
    }
    
    // Optimize source fields for performance
    if (!optimized._source && intent.analysisType === 'search') {
      optimized._source = [
        'job_title',
        'company_name',
        'location',
        'standardized_location',
        'raw_salary',
        'posted_date',
        'url'
      ];
    }
    
    // Add track_total_hits for aggregations
    if (intent.analysisType === 'aggregation') {
      optimized.track_total_hits = true;
      optimized.size = 0; // Don't return documents for pure aggregations
    }
    
    return optimized;
  }
}
```

### src/sidepanel/components/ChatInterface.tsx
```
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, QueryResult } from '../../shared/types/ui';
import { QueryOptionCard } from './QueryOptionCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Send, RotateCcw } from 'lucide-react';

interface ChatInterfaceProps {
  onQuerySubmit: (query: string) => Promise;
  debugMode: boolean;
  isConnected: boolean;
}

export const ChatInterface: React.FC = ({ 
  onQuerySubmit, 
  debugMode,
  isConnected 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isConnected) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const results = await onQuerySubmit(inputValue.trim());
      
      if (results && results.length > 0) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `Generated ${results.length} query option${results.length > 1 ? 's' : ''}:`,
          timestamp: new Date(),
          queryResults: results
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'error',
          content: 'No valid queries could be generated. Please try rephrasing your request.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Query generation error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `Error: ${error.message || 'Failed to generate query. Please check your LLM configuration.'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const exampleQueries = [
    "Find software engineer jobs in San Francisco",
    "Show me remote jobs requiring Python",
    "Jobs at Google or Microsoft posted last week",
    "Count jobs by company in Germany"
  ];

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  return (
    
      {/* Header */}
      
        
          Elasticsearch Query Helper
        
        
          
          
            {isConnected ? 'Connected' : 'Disconnected'}
          
          {messages.length > 0 && (
            
              
            
          )}
        
      
      
      {/* Messages Area */}
      
        {messages.length === 0 && (
          
            
              Welcome to Elasticsearch Query Helper
            
            
              Describe what you're looking for and I'll generate the perfect Elasticsearch query.
            
            
              Try these examples:
              {exampleQueries.map((example, index) => (
                 handleExampleClick(example)}
                  className="block w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  {example}
                
              ))}
            
          
        )}
        
        {messages.map(message => (
          
        ))}
        
        {isLoading && (
          
            
            Processing your request...
          
        )}
        
        
      
      
      {/* Input Form */}
      
        
           setInputValue(e.target.value)}
            placeholder={isConnected ? "Describe what you're looking for..." : "Configure LLM provider in settings first"}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading || !isConnected}
            maxLength={500}
          />
          
            
          
        
        {inputValue.length > 400 && (
          
            {500 - inputValue.length} characters remaining
          
        )}
      
    
  );
};

const MessageBubble: React.FC = ({ message, debugMode }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';
  
  return (
    
      
        {message.content}
        
        {message.queryResults && message.queryResults.length > 0 && (
          
            {message.queryResults.map((result, index) => (
              
            ))}
          
        )}
        
        
          {message.timestamp.toLocaleTimeString()}
        
      
    
  );
};
```

### src/data/sample-queries.json
```
{
  "sampleQueries": [
    {
      "id": "basic_source_search",
      "description": "Find jobs from specific job board with recent crawl date",
      "userIntent": "source-based filtering with time constraint",
      "query": {
        "query": {
          "bool": {
            "must": [
              {"match": {"source_name.keyword": "Indeed_US"}},
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-7d/d", "lte": "now"}}}
            ]
          }
        },
        "size": 50
      },
      "tags": ["source_filter", "date_range", "basic_search"],
      "complexity": "simple",
      "successRate": 95,
      "performanceNotes": "Fast execution with indexed fields"
    },
    {
      "id": "geo_proximity_search",
      "description": "Find jobs within 50km of Frankfurt",
      "userIntent": "location-based proximity search",
      "query": {
        "query": {
          "bool": {
            "must": [
              {"term": {"is_deleted.keyword": "0"}},
              {"term": {"is_duplicate": false}}
            ],
            "filter": [
              {
                "geo_distance": {
                  "distance": "50km",
                  "standardized_geo_point": {
                    "lat": 50.1109,
                    "lon": 8.6821
                  }
                }
              },
              {"range": {"crawled_date": {"gte": "now-30d/d"}}}
            ]
          }
        }
      },
      "tags": ["geo_search", "location", "proximity"],
      "complexity": "medium",
      "successRate": 88,
      "performanceNotes": "Requires geo-enabled fields"
    },
    {
      "id": "skills_match_search",
      "description": "Find software engineering jobs requiring Python and machine learning",
      "userIntent": "skills and title matching",
      "query": {
        "query": {
          "bool": {
            "must": [
              {"match": {"job_title": "software engineer"}},
              {"match": {"job_description": "Python"}},
              {"match": {"job_description": "machine learning"}},
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-14d/d"}}}
            ]
          }
        }
      },
      "tags": ["skills", "job_title", "technology"],
      "complexity": "medium",
      "successRate": 92,
      "performanceNotes": "Good performance with proper field analysis"
    },
    {
      "id": "company_filter_search",
      "description": "Find all jobs at Google or Microsoft",
      "userIntent": "company-specific job search",
      "query": {
        "query": {
          "bool": {
            "must": [
              {
                "terms": {
                  "company_name.keyword": ["Google", "Microsoft", "Alphabet Inc."]
                }
              },
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-30d/d"}}}
            ]
          }
        }
      },
      "tags": ["company", "multiple_values", "exact_match"],
      "complexity": "simple",
      "successRate": 96,
      "performanceNotes": "Very fast with keyword fields"
    },
    {
      "id": "salary_range_search",
      "description": "Find jobs with salary information excluding N/A values",
      "userIntent": "salary-based filtering",
      "query": {
        "query": {
          "bool": {
            "must": [
              {"exists": {"field": "raw_salary"}},
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "must_not": [
              {"match_phrase": {"raw_salary": "NA"}},
              {"match_phrase": {"raw_salary": "#N/A"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-7d/d"}}}
            ]
          }
        }
      },
      "tags": ["salary", "exists", "exclusion"],
      "complexity": "medium",
      "successRate": 85,
      "performanceNotes": "Exists queries can be slower on large datasets"
    },
    {
      "id": "date_range_field_selection",
      "description": "Get specific fields for jobs posted in date range",
      "userIntent": "targeted field retrieval with date filtering",
      "query": {
        "_source": ["job_title", "company_name", "location", "raw_salary", "url"],
        "query": {
          "bool": {
            "must": [
              {
                "range": {
                  "posted_date": {
                    "gte": "2024-01-01",
                    "lte": "2024-12-31"
                  }
                }
              },
              {"term": {"is_deleted.keyword": "0"}}
            ]
          }
        }
      },
      "tags": ["field_selection", "date_range", "performance"],
      "complexity": "simple",
      "successRate": 94,
      "performanceNotes": "Field selection improves network performance"
    },
    {
      "id": "country_aggregation",
      "description": "Count jobs by country code",
      "userIntent": "statistical analysis by location",
      "query": {
        "size": 0,
        "query": {
          "bool": {
            "must": [
              {"term": {"is_deleted.keyword": "0"}},
              {"range": {"crawled_date": {"gte": "now-30d/d"}}}
            ]
          }
        },
        "aggs": {
          "jobs_by_country": {
            "terms": {
              "field": "country_code.keyword",
              "size": 50,
              "order": {"_count": "desc"}
            }
          }
        }
      },
      "tags": ["aggregation", "statistics", "country"],
      "complexity": "medium",
      "successRate": 91,
      "performanceNotes": "Aggregations benefit from size:0"
    },
    {
      "id": "complex_multi_criteria",
      "description": "Lufthansa cabin crew roles in German aviation hubs",
      "userIntent": "complex business search with multiple location and title criteria",
      "query": {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {"wildcard": {"job_title.keyword": "*Crew*"}},
                    {"wildcard": {"job_title.keyword": "*Cabin*"}},
                    {"wildcard": {"job_title.keyword": "*Flight*"}},
                    {"match": {"job_title": "scheduler"}}
                  ],
                  "minimum_should_match": 1
                }
              },
              {"term": {"country_code.keyword": "DE"}},
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "should": [
              {"match": {"company_name": "Lufthansa"}},
              {"match": {"location": "Frankfurt"}},
              {"match": {"location": "Munich"}},
              {"match": {"location": "Hamburg"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-60d/d"}}}
            ]
          }
        }
      },
      "tags": ["complex", "wildcard", "multiple_locations", "aviation"],
      "complexity": "complex",
      "successRate": 78,
      "performanceNotes": "Wildcard queries can impact performance"
    },
    {
      "id": "tech_stack_search",
      "description": "Find developers with specific technology stack",
      "userIntent": "technology-specific role matching",
      "query": {
        "query": {
          "bool": {
            "must": [
              {"match": {"job_title": "developer"}},
              {"match": {"job_description": "React"}},
              {"match": {"job_description": "Node.js"}},
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "should": [
              {"match": {"job_description": "TypeScript"}},
              {"match": {"job_description": "MongoDB"}},
              {"match": {"job_description": "AWS"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-21d/d"}}}
            ]
          }
        }
      },
      "tags": ["technology", "development", "stack"],
      "complexity": "medium",
      "successRate": 89,
      "performanceNotes": "Good balance of must/should clauses"
    },
    {
      "id": "remote_work_search",
      "description": "Find remote jobs in specific categories",
      "userIntent": "remote work opportunity search",
      "query": {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {"match": {"job_description": "remote"}},
                    {"match": {"job_description": "work from home"}},
                    {"match": {"job_description": "telecommute"}},
                    {"match": {"location": "remote"}}
                  ],
                  "minimum_should_match": 1
                }
              },
              {"term": {"is_deleted.keyword": "0"}}
            ],
            "filter": [
              {"range": {"crawled_date": {"gte": "now-14d/d"}}}
            ]
          }
        }
      },
      "tags": ["remote", "flexible_work", "location_independent"],
      "complexity": "medium",
      "successRate": 86,
      "performanceNotes": "Text matching works well for remote work detection"
    }
  ]
}
```

### tests/agents/IntentParserAgent.test.ts
```
// tests/agents/IntentParserAgent.test.ts
import { IntentParserAgent } from '../../src/background/agents/IntentParserAgent';
import { LLMClient } from '../../src/background/services/LLMClient';

describe('IntentParserAgent', () => {
  let agent: IntentParserAgent;
  let mockLLMClient: jest.Mocked;

  beforeEach(() => {
    mockLLMClient = {
      generateCompletion: jest.fn(),
      testConnection: jest.fn()
    } as any;
    agent = new IntentParserAgent(mockLLMClient);
  });

  test('should parse simple job search query', async () => {
    const mockResponse = JSON.stringify({
      entities: {
        companies: [],
        locations: ['San Francisco'],
        skills: ['JavaScript'],
        jobTitles: ['Software Engineer'],
        dateRanges: [],
        salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'simple',
      confidence: 0.9
    });

    mockLLMClient.generateCompletion.mockResolvedValue(mockResponse);

    const mockContext = {
      userInput: 'Find software engineer jobs in San Francisco requiring JavaScript',
      schema: { mappings: { properties: {} }, version: '7.x', lastUpdated: new Date(), indexName: 'jobs' },
      sampleQueries: [],
      config: { provider: 'gemini', model: 'gemini-1.5-pro', temperature: 0.1, maxTokens: 4096, timeout: 30000, retryAttempts: 3 },
      debugMode: false,
      sessionId: 'test-session'
    } as any;

    const result = await agent.parse(
      'Find software engineer jobs in San Francisco requiring JavaScript',
      mockContext
    );

    expect(result.entities.jobTitles).toContain('Software Engineer');
    expect(result.entities.locations).toContain('San Francisco');
    expect(result.entities.skills).toContain('JavaScript');
    expect(result.analysisType).toBe('search');
    expect(result.complexity).toBe('simple');
    expect(result.confidence).toBe(0.9);
  });

  test('should handle malformed LLM response', async () => {
    mockLLMClient.generateCompletion.mockResolvedValue('Invalid JSON response');

    const mockContext = {
      userInput: 'test query',
      schema: { mappings: { properties: {} }, version: '7.x', lastUpdated: new Date(), indexName: 'jobs' },
      sampleQueries: [],
      config: { provider: 'gemini', model: 'gemini-1.5-pro', temperature: 0.1, maxTokens: 4096, timeout: 30000, retryAttempts: 3 },
      debugMode: false,
      sessionId: 'test-session'
    } as any;

    await expect(agent.parse('test query', mockContext)).rejects.toThrow('Intent parsing failed');
  });
});
```

### tests/integration/end-to-end.test.ts
```
// tests/integration/end-to-end.test.ts
import { AgentOrchestrator } from '../../src/background/agents/AgentOrchestrator';

describe('End-to-End Query Generation', () => {
  let orchestrator: AgentOrchestrator;

  beforeAll(async () => {
    // Setup test environment
    orchestrator = new AgentOrchestrator();
    await orchestrator.initialize();
  });

  test('should generate valid query for simple request', async () => {
    const result = await orchestrator.processQuery('Find software engineer jobs');
    
    expect(result).toBeDefined();
    expect(result.queryResults.length).toBeGreaterThan(0);
    expect(result.queryResults.validation.isValid).toBe(true);
    expect(result.queryResults.validation.score).toBeGreaterThan(70);
  }, 30000);

  test('should handle complex aggregation request', async () => {
    const result = await orchestrator.processQuery('Count jobs by company in the last month');
    
    expect(result).toBeDefined();
    expect(result.queryResults.query.aggs).toBeDefined();
    expect(result.queryResults.query.size).toBe(0);
  }, 30000);
});
```

### docs/API.md
```
# API Documentation

This document outlines the API specifications for the Elasticsearch Query Helper AI Chrome Extension.

## Background Script API

The background script (`background.ts`) exposes functionality to the side panel UI via `chrome.runtime.sendMessage`.

### Message Types

#### 1. `PROCESS_QUERY`
   - **Direction**: Side Panel -> Background
   - **Payload**: 
     ```json
     {
       "userInput": "string" 
     }
     ```
   - **Response**: 
     ```json
     {
       "data": {
         "allResults": "QueryResult[]", // Array of ranked query options
         "bestResult": "QueryResult | null", // The top-ranked query result
         "agentLogs": "AgentLog[]" // If debug mode is enabled
       },
       // OR
       "error": "string" // Error message if processing failed
     }
     ```
   - **Description**: Initiates the multi-agent pipeline to process the user's natural language input and generate Elasticsearch queries.

#### 2. `UPDATE_LLM_CONFIG`
   - **Direction**: Side Panel -> Background
   - **Payload**: *(No explicit payload, background script reads from `chrome.storage`)*
     Implicitly, the side panel should have saved new configuration to `chrome.storage.local` using `StorageManager` via its hooks before sending this message.
   - **Response**:
     ```json
     {
       "success": "boolean",
       "message": "string" // Optional message
       // OR
       "error": "string"
     }
     ```
   - **Description**: Notifies the background script that LLM configuration (provider, model, API key, etc.) has been updated in storage. The background script should re-initialize its `AgentOrchestrator` and `LLMClient` with the new settings.

#### 3. `UPDATE_DEBUG_MODE`
    - **Direction**: Side Panel -> Background
    - **Payload**: *(No explicit payload, 
```

---

## Build and Deployment Instructions

### Development Setup
```
# 1. Clone and install dependencies
npm install

# 2. Start development build
npm run dev

# 3. Load extension in Chrome
# - Open chrome://extensions/
# - Enable Developer mode
# - Click "Load unpacked"
# - Select the dist/ folder

# 4. Run tests
npm test

# 5. Type checking
npm run type-check

# 6. Linting
npm run lint
```

### Production Build
```
# 1. Create production build
npm run build

# 2. Package for distribution
npm run package

# 3. Upload elasticsearch-query-helper.zip to Chrome Web Store
```

---

## Success Criteria and Acceptance Tests

### Functional Requirements
1. **FR-101**: Natural Language Input Processing
   - ✅ Accept free-form text input
   - ✅ Handle various query styles and formats
   - ✅ Process input within 45 seconds

2. **FR-102**: Multi-Agent Processing
   - ✅ Intent Parser extracts entities and analysis type
   - ✅ Perspective Agent generates analytical approaches
   - ✅ Query Builder creates valid Elasticsearch DSL
   - ✅ Validation Agent checks syntax and schema compliance
   - ✅ Consensus Agent reviews and approves queries

3. **FR-103**: Query Validation
   - ✅ Syntax validation >90% accuracy
   - ✅ Schema compliance checking
   - ✅ Performance impact assessment
   - ✅ Security vulnerability detection

### Performance Requirements
- **Response Time**: 85% of generated queries are syntactically correct
- **Schema Compliance**: >95% of queries use correct field names
- **User Satisfaction**: >75% positive feedback

### Technical Requirements
- **LLM Provider Support**: Gemini, OpenAI, Anthropic, Ollama
- **Chrome Compatibility**: Manifest V3 compliance
- **Error Handling**: Graceful failure recovery
- **Debug Capabilities**: Comprehensive agent logging

---

## Deployment Checklist

### Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Type checking successful
- [ ] Linting clean
- [ ] Build generates without errors
- [ ] Manual testing completed

### Chrome Extension Package
- [ ] manifest.json configured correctly
- [ ] Icons included (16x16, 48x48, 128x128)
- [ ] Permissions minimal and necessary
- [ ] Content Security Policy configured
- [ ] Host permissions for LLM APIs

### Documentation
- [ ] API documentation complete
- [ ] Troubleshooting guide available
- [ ] User guide created
- [ ] Developer setup instructions

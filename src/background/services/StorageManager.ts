// Placeholder for StorageManager
import { LLMConfiguration } from '../../shared/types/llm';
import { ElasticsearchSchema, SampleQuery } from '../../shared/types/elasticsearch';

// Default values or initial structures
const DEFAULT_SCHEMA: ElasticsearchSchema = {
  mappings: { properties: {} },
  version: "1.0",
  lastUpdated: new Date(),
  indexName: "default_index"
};

const DEFAULT_SAMPLE_QUERIES: SampleQuery[] = [];

export class StorageManager {
  constructor() {
    console.log("StorageManager initialized");
  }

  // LLM Configuration
  async getLLMConfig(): Promise<LLMConfiguration | null> {
    try {
      const result = await chrome.storage.local.get(['llmConfig']);
      return result.llmConfig ? (result.llmConfig as LLMConfiguration) : null;
    } catch (error) {
      console.error("Error getting LLM config from storage:", error);
      return null;
    }
  }

  async setLLMConfig(config: LLMConfiguration): Promise<void> {
    try {
      await chrome.storage.local.set({ llmConfig: config });
      console.log("LLM config saved to storage.");
    } catch (error) {
      console.error("Error saving LLM config to storage:", error);
    }
  }

  // Debug Mode
  async getDebugMode(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(['debugMode']);
      return result.debugMode === true; // Ensure it's explicitly true
    } catch (error) {
      console.error("Error getting debug mode from storage:", error);
      return false; // Default to false on error
    }
  }

  async setDebugMode(debugMode: boolean): Promise<void> {
    try {
      await chrome.storage.local.set({ debugMode: debugMode });
      console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'} and saved to storage.`);
    } catch (error) {
      console.error("Error saving debug mode to storage:", error);
    }
  }

  // Elasticsearch Schema
  async getSchema(): Promise<ElasticsearchSchema> {
    try {
      const result = await chrome.storage.local.get(['elasticsearchSchema']);
      return result.elasticsearchSchema ? (result.elasticsearchSchema as ElasticsearchSchema) : DEFAULT_SCHEMA;
    } catch (error) {
      console.error("Error getting schema from storage:", error);
      return DEFAULT_SCHEMA; // Return default on error
    }
  }

  async setSchema(schema: ElasticsearchSchema): Promise<void> {
    try {
      await chrome.storage.local.set({ elasticsearchSchema: schema });
      console.log("Elasticsearch schema saved to storage.");
    } catch (error) {
      console.error("Error saving schema to storage:", error);
    }
  }
  
  // Sample Queries
  async getSampleQueries(): Promise<SampleQuery[]> {
    try {
      const result = await chrome.storage.local.get(['sampleQueries']);
      return result.sampleQueries ? (result.sampleQueries as SampleQuery[]) : DEFAULT_SAMPLE_QUERIES;
    } catch (error) {
      console.error("Error getting sample queries from storage:", error);
      return DEFAULT_SAMPLE_QUERIES;
    }
  }

  async setSampleQueries(queries: SampleQuery[]): Promise<void> {
    try {
      await chrome.storage.local.set({ sampleQueries: queries });
      console.log("Sample queries saved to storage.");
    } catch (error) {
      console.error("Error saving sample queries to storage:", error);
    }
  }

  // Generic getter/setter for other settings if needed
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] ? (result[key] as T) : null;
    } catch (error) {
      console.error(`Error getting item '${key}' from storage:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
      console.log(`Item '${key}' saved to storage.`);
    } catch (error) {
      console.error(`Error saving item '${key}' to storage:`, error);
    }
  }
}

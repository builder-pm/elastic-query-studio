// Placeholder for AgentOrchestrator
import { LLMClient } from '../services/LLMClient';
import { IntentParserAgent } from './IntentParserAgent';
import { PerspectiveAgent } from './PerspectiveAgent';
import { QueryBuilderAgent } from './QueryBuilderAgent';
import { ValidationAgent } from './ValidationAgent';
import { ConsensusAgent } from './ConsensusAgent';
import { CacheManager } from '../services/CacheManager';
import { StorageManager } from '../services/StorageManager';
import { AgentContext, AgentLog, ParsedIntent, QueryPerspective, QueryResult } from '../../shared/types/agents';
import { LLMConfiguration } from '../../shared/types/llm';
import { ElasticsearchSchema, SampleQuery, ESQuery } from '../../shared/types/elasticsearch';

// Default configuration (can be overridden by settings)
const DEFAULT_LLM_CONFIG: LLMConfiguration = {
  provider: 'gemini',
  model: 'gemini-1.5-pro-latest', // Or your preferred default
  temperature: 0.2,
  maxTokens: 2048,
  timeout: 30000,
  retryAttempts: 2,
  // apiKey and baseUrl might be loaded from storage
};

export class AgentOrchestrator {
  private llmClient: LLMClient;
  private intentParser: IntentParserAgent;
  private perspectiveAgent: PerspectiveAgent;
  private queryBuilder: QueryBuilderAgent;
  private validationAgent: ValidationAgent;
  private consensusAgent: ConsensusAgent;
  private cacheManager: CacheManager;
  private storageManager: StorageManager;
  private currentConfig: LLMConfiguration;
  private currentSchema?: ElasticsearchSchema;
  private sampleQueries?: SampleQuery[];
  private agentLogs: AgentLog[] = [];
  private debugMode: boolean = false;

  constructor() {
    this.storageManager = new StorageManager();
    this.currentConfig = DEFAULT_LLM_CONFIG; // Start with default
    this.llmClient = new LLMClient(this.currentConfig);
    this.intentParser = new IntentParserAgent(this.llmClient);
    this.perspectiveAgent = new PerspectiveAgent(); // Assuming it doesn't need LLMClient directly
    this.queryBuilder = new QueryBuilderAgent(this.llmClient);
    this.validationAgent = new ValidationAgent();
    this.consensusAgent = new ConsensusAgent();
    this.cacheManager = new CacheManager();
    
    this.initializeConfiguration();
    console.log("AgentOrchestrator initialized");
  }

  async initializeConfiguration() {
    try {
      const storedConfig = await this.storageManager.getLLMConfig();
      if (storedConfig) {
        this.currentConfig = storedConfig;
        this.llmClient = new LLMClient(this.currentConfig); // Re-initialize with stored config
        this.intentParser = new IntentParserAgent(this.llmClient);
        this.queryBuilder = new QueryBuilderAgent(this.llmClient);
      }
      this.debugMode = await this.storageManager.getDebugMode();
      this.currentSchema = await this.storageManager.getSchema();
      this.sampleQueries = await this.storageManager.getSampleQueries();
      console.log("AgentOrchestrator configuration loaded.");
    } catch (error) {
      console.error("Error initializing AgentOrchestrator configuration:", error);
    }
  }
  
  public async updateLLMConfig(newConfig: LLMConfiguration) {
    this.currentConfig = newConfig;
    this.llmClient = new LLMClient(this.currentConfig);
    this.intentParser = new IntentParserAgent(this.llmClient);
    this.queryBuilder = new QueryBuilderAgent(this.llmClient);
    await this.storageManager.setLLMConfig(newConfig);
    console.log("AgentOrchestrator LLM config updated.");
  }

  public async setDebugMode(debugMode: boolean) {
    this.debugMode = debugMode;
    await this.storageManager.setDebugMode(debugMode);
     console.log(`Debug mode set to: ${debugMode}`);
  }

  async processQuery(userInput: string): Promise<{ allResults: QueryResult[], bestResult: QueryResult | null, agentLogs?: AgentLog[] }> {
    this.agentLogs = []; // Clear logs for new query
    const sessionId = `session-${Date.now()}`;

    const context: AgentContext = {
      userInput,
      schema: this.currentSchema || { mappings: { properties: {} }, version: 'unknown', lastUpdated: new Date(), indexName: 'unknown' },
      sampleQueries: this.sampleQueries || [],
      config: this.currentConfig,
      debugMode: this.debugMode,
      sessionId,
      agentLogs: this.agentLogs // Pass the orchestrator's log collector
    };

    try {
      // 1. Intent Parsing
      const parsedIntent: ParsedIntent = await this.intentParser.parse(userInput, context);
      if (this.debugMode) console.log("Parsed Intent:", parsedIntent);

      // 2. Perspective Generation
      const perspectives: QueryPerspective[] = this.perspectiveAgent.generatePerspectives(parsedIntent, context);
      if (this.debugMode) console.log("Generated Perspectives:", perspectives);

      // 3. Query Building & Validation for each perspective
      const queryResults: QueryResult[] = [];
      for (const perspective of perspectives) {
        try {
          const query: ESQuery = await this.queryBuilder.buildQuery(parsedIntent, perspective, context);
          if (this.debugMode) console.log(`Query for perspective ${perspective.name}:`, query);
          
          const validation: ValidationResult = this.validationAgent.validateQuery(query, context.schema);
          if (this.debugMode) console.log(`Validation for perspective ${perspective.name}:`, validation);

          queryResults.push({
            query,
            perspective,
            validation,
            reasoning: `Query built based on ${perspective.name} perspective. ${perspective.reasoning}`,
            complexity: perspective.estimatedComplexity, // Or recalculate based on query
            // estimatedPerformance: {}, // Placeholder
            agentLogs: context.agentLogs || [], // Persist logs from this path
          } as QueryResult); // Type assertion for partial PerformanceMetrics
        } catch (error: any) {
          console.error(`Error processing perspective ${perspective.name}:`, error);
           if (context.agentLogs) {
            context.agentLogs.push({
              timestamp: new Date(), agent: 'AgentOrchestrator', action: `processPerspective-${perspective.name}`,
              input: { perspective }, output: null, duration: 0, success: false, error: error.message
            });
          }
        }
      }

      // 4. Consensus
      const bestResult: QueryResult | null = this.consensusAgent.selectBestQuery(queryResults, context.agentLogs);
      if (this.debugMode) console.log("Best Result:", bestResult);

      return {
        allResults: queryResults,
        bestResult,
        agentLogs: this.debugMode ? this.agentLogs : undefined
      };

    } catch (error: any) {
      console.error("Error in AgentOrchestrator processQuery:", error);
      this.agentLogs.push({
        timestamp: new Date(), agent: 'AgentOrchestrator', action: 'processQuery',
        input: { userInput }, output: null, duration: 0, success: false, error: error.message
      });
      throw error; // Re-throw to be caught by the caller
    }
  }
}

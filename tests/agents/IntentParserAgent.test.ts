// tests/agents/IntentParserAgent.test.ts
import { IntentParserAgent } from '../../src/background/agents/IntentParserAgent';
import { LLMClient } from '../../src/background/services/LLMClient';
import { AgentContext, ParsedIntent } from '../../src/shared/types/agents'; // Added ParsedIntent
import { LLMConfiguration } from '../../src/shared/types/llm'; // Added LLMConfiguration
import { ElasticsearchSchema, SampleQuery } from '../../src/shared/types/elasticsearch'; // Added SampleQuery and ElasticsearchSchema

describe('IntentParserAgent', () => {
  let agent: IntentParserAgent;
  let mockLLMClient: jest.Mocked<LLMClient>; // Typed mock

  beforeEach(() => {
    // Provide a mock implementation for LLMClient
    mockLLMClient = {
      generateCompletion: jest.fn(),
      testConnection: jest.fn().mockResolvedValue(true) // Mock testConnection
    } as jest.Mocked<LLMClient>;
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

    const mockContext: AgentContext = { // Typed mockContext
      userInput: 'Find software engineer jobs in San Francisco requiring JavaScript',
      schema: { 
        mappings: { properties: {
          job_title: { type: 'text'}, 
          location: { type: 'text'},
          skills: {type: 'text'}
        } }, 
        version: '7.x', 
        lastUpdated: new Date(), 
        indexName: 'jobs' 
      } as ElasticsearchSchema, // Type assertion for schema
      sampleQueries: [] as SampleQuery[], // Type assertion for sampleQueries
      config: { 
        provider: 'gemini', 
        model: 'gemini-1.5-pro', 
        temperature: 0.1, 
        maxTokens: 4096, 
        timeout: 30000, 
        retryAttempts: 3 
      } as LLMConfiguration, // Type assertion for config
      debugMode: false,
      sessionId: 'test-session',
      agentLogs: [] // Added agentLogs
    };

    const result: ParsedIntent = await agent.parse( // Typed result
      'Find software engineer jobs in San Francisco requiring JavaScript',
      mockContext
    );

    expect(result.entities.jobTitles).toContain('Software Engineer');
    expect(result.entities.locations).toContain('San Francisco');
    expect(result.entities.skills).toContain('JavaScript'); // Corrected from 'Javascript'
    expect(result.analysisType).toBe('search');
    expect(result.complexity).toBe('simple');
    expect(result.confidence).toBe(0.9);
  });

  test('should handle malformed LLM response', async () => {
    mockLLMClient.generateCompletion.mockResolvedValue('Invalid JSON response');

    const mockContext: AgentContext = { // Typed mockContext
      userInput: 'test query',
      schema: { 
        mappings: { properties: {} }, 
        version: '7.x', 
        lastUpdated: new Date(), 
        indexName: 'jobs' 
      } as ElasticsearchSchema,
      sampleQueries: [] as SampleQuery[],
      config: { 
        provider: 'gemini', 
        model: 'gemini-1.5-pro', 
        temperature: 0.1, 
        maxTokens: 4096, 
        timeout: 30000, 
        retryAttempts: 3 
      } as LLMConfiguration,
      debugMode: false,
      sessionId: 'test-session',
      agentLogs: []
    };

    await expect(agent.parse('test query', mockContext)).rejects.toThrow('Intent parsing failed');
  });
});

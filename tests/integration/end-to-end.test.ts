// tests/integration/end-to-end.test.ts
import { AgentOrchestrator } from '../../src/background/agents/AgentOrchestrator';
import { QueryResult } from '../../src/shared/types/agents'; // Added for typing

// Mock chrome.storage.local for the orchestrator's StorageManager
const mockChromeStorage = {
  local: {
    get: jest.fn((keys, callback) => {
      // Simulate no stored config initially, or provide defaults
      const result: any = {};
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          if (key === 'llmConfig') result[key] = null; // Default to no stored config
          if (key === 'debugMode') result[key] = false;
          if (key === 'elasticsearchSchema') result[key] = { mappings: { properties: {} }, version: 'test', lastUpdated: new Date(), indexName: 'test-idx' };
          if (key === 'sampleQueries') result[key] = [];
        });
      } else {
         if (keys === 'llmConfig') result[keys] = null;
         if (keys === 'debugMode') result[keys] = false;
         if (keys === 'elasticsearchSchema') result[keys] = { mappings: { properties: {} }, version: 'test', lastUpdated: new Date(), indexName: 'test-idx' };
         if (keys === 'sampleQueries') result[keys] = [];
      }
      callback(result);
    }),
    set: jest.fn((items, callback) => {
      if (callback) callback();
    }),
    // Add other methods if AgentOrchestrator's StorageManager uses them
    // clear: jest.fn(), remove: jest.fn(),
  }
};

// @ts-ignore
global.chrome = {
  storage: mockChromeStorage,
  runtime: {
    lastError: null,
    // Mock other chrome.runtime properties if needed by your code
  }
  // Mock other chrome APIs if needed
} as any;


describe('End-to-End Query Generation', () => {
  let orchestrator: AgentOrchestrator;

  beforeAll(async () => {
    // Setup test environment
    orchestrator = new AgentOrchestrator(); // Will use mocked storage
    // Initialization might involve async calls to storage, ensure it completes
    await orchestrator.initializeConfiguration(); 
  });

  test('should generate valid query for simple request', async () => {
    // Mock LLMClient within the orchestrator or its agents if they make actual API calls
    // For this test, we assume the placeholder agents/LLMClient might return mock data
    // or that the LLMClient's generateCompletion is globally mocked by Jest if it makes network requests.
    
    // Example: Mocking generateCompletion for all LLMClients created
    // This is a bit broad; ideally, you'd inject a mocked LLMClient into the orchestrator.
    jest.spyOn(require('../../src/background/services/LLMClient').LLMClient.prototype, 'generateCompletion')
        .mockImplementation(async (prompt: string, systemPrompt?: string) => {
            if (prompt.includes("Extract structured intent")) { // IntentParser prompt
                 return JSON.stringify({
                    entities: { jobTitles: ['software engineer'] },
                    analysisType: 'search',
                    complexity: 'simple',
                    confidence: 0.85
                });
            } else if (prompt.includes("BUILD ELASTICSEARCH QUERY")) { // QueryBuilder prompt
                return JSON.stringify({ query: { term: { "job_title.keyword": "software engineer" } } });
            }
            return 'Unexpected prompt';
        });


    const result = await orchestrator.processQuery('Find software engineer jobs');
    
    expect(result).toBeDefined();
    expect(result.allResults.length).toBeGreaterThan(0);
    const bestResult = result.bestResult as QueryResult; // Type assertion
    expect(bestResult).not.toBeNull();
    expect(bestResult.validation.isValid).toBe(true);
    // The default validation score is 80 for a valid query
    expect(bestResult.validation.score).toBeGreaterThanOrEqual(70); 
  }, 30000); // Increased timeout for potentially longer async operations

  test('should handle complex aggregation request', async () => {
     jest.spyOn(require('../../src/background/services/LLMClient').LLMClient.prototype, 'generateCompletion')
        .mockImplementation(async (prompt: string, systemPrompt?: string) => {
            if (prompt.includes("Extract structured intent")) {
                 return JSON.stringify({
                    entities: { companies: ['Acme Corp'] },
                    analysisType: 'aggregation',
                    complexity: 'medium',
                    confidence: 0.9
                });
            } else if (prompt.includes("BUILD ELASTICSEARCH QUERY")) {
                return JSON.stringify({ 
                    size: 0, 
                    aggs: { 
                        jobs_by_company: { 
                            terms: { field: "company_name.keyword" } 
                        } 
                    } 
                });
            }
            return 'Unexpected prompt for aggregation';
        });

    const result = await orchestrator.processQuery('Count jobs by company Acme Corp in the last month');
    
    expect(result).toBeDefined();
    const bestResult = result.bestResult as QueryResult;
    expect(bestResult).not.toBeNull();
    expect(bestResult.query.aggs).toBeDefined();
    expect(bestResult.query.size).toBe(0);
  }, 30000);
});

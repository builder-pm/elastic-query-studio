import { PerspectiveAgent } from '../../src/background/agents/PerspectiveAgent';
import { ParsedIntent, AgentContext, QueryPerspective } from '../../src/shared/types/agents';
import { LLMConfiguration } from '../../src/shared/types/llm';
import { ElasticsearchSchema, SampleQuery } from '../../src/shared/types/elasticsearch';

describe('PerspectiveAgent', () => {
  let perspectiveAgent: PerspectiveAgent;
  let mockContext: AgentContext;

  beforeEach(() => {
    perspectiveAgent = new PerspectiveAgent();
    // Basic mock context, can be customized per test
    mockContext = {
      userInput: '',
      schema: { mappings: { properties: {} }, version: '7.x', lastUpdated: new Date(), indexName: 'jobs' } as ElasticsearchSchema,
      sampleQueries: [] as SampleQuery[],
      config: { provider: 'gemini', model: 'test-model', temperature: 0.1, maxTokens: 100, timeout: 5000, retryAttempts: 1 } as LLMConfiguration,
      debugMode: false,
      sessionId: 'test-session-id',
      agentLogs: []
    };
  });

  test('should generate Analytics perspective for aggregation intent', () => {
    const intent: ParsedIntent = {
      entities: {},
      analysisType: 'aggregation',
      complexity: 'medium',
      confidence: 0.9,
      rawInput: 'count jobs by company'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBeGreaterThanOrEqual(1);
    expect(perspectives[0].name).toBe('Data Aggregation / Statistical Analysis');
    expect(perspectives[0].approach).toBe('analytics');
    expect(perspectives[0].confidence).toBe(0.9);
  });

  test('should generate Targeted Search for specific entities', () => {
    const intent: ParsedIntent = {
      entities: {
        jobTitles: ['software engineer'],
        locations: ['San Francisco'],
        companies: [],
        skills: [],
        dateRanges: [],
        salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'simple',
      confidence: 0.85,
      rawInput: 'software engineer jobs in San Francisco'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBeGreaterThanOrEqual(1);
    const targetedSearch = perspectives.find(p => p.name === 'Targeted Search');
    expect(targetedSearch).toBeDefined();
    expect(targetedSearch?.approach).toBe('exact_match');
    expect(targetedSearch?.confidence).toBeCloseTo(0.85 * 0.85);
  });

  test('should generate Skills-Focused Search when skills are present', () => {
    const intent: ParsedIntent = {
      entities: {
        skills: ['python', 'machine learning'],
        jobTitles: [], companies: [], locations: [], dateRanges: [], salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'medium',
      confidence: 0.8,
      rawInput: 'jobs requiring python and machine learning'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBeGreaterThanOrEqual(1);
    const skillsSearch = perspectives.find(p => p.name === 'Skills-Focused Search');
    expect(skillsSearch).toBeDefined();
    expect(skillsSearch?.approach).toBe('fuzzy_search');
  });
  
  test('should generate Location Focused Search when location is prominent', () => {
    const intent: ParsedIntent = {
      entities: {
        locations: ['Berlin', 'Germany'],
        jobTitles: [], companies: [], skills: [], dateRanges: [], salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'simple',
      confidence: 0.7,
      rawInput: 'jobs in Berlin, Germany'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    const locationSearch = perspectives.find(p => p.name === "Location Focused Search");
    // This test assumes "Location Focused Search" is generated if "Targeted Search" isn't (due to !perspectives.some(p=>p.name === "Targeted Search") condition)
    // If jobTitles were also present, Targeted Search might take precedence.
    expect(locationSearch).toBeDefined();
    expect(locationSearch?.approach).toBe('exact_match');
  });

  test('should generate Time-Based Trend Search for date ranges', () => {
    const intent: ParsedIntent = {
      entities: {
        dateRanges: [{ gte: 'now-30d/d', lte: 'now/d' }],
        jobTitles: [], companies: [], locations: [], skills: [], salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'simple',
      confidence: 0.7,
      rawInput: 'jobs in the last 30 days'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    const trendSearch = perspectives.find(p => p.name === "Time-Based Trend Search");
    expect(trendSearch).toBeDefined();
    expect(trendSearch?.approach).toBe('trend_analysis');
  });

  test('should generate General Search as fallback for search type if no other specifics fit', () => {
    const intent: ParsedIntent = {
      entities: { jobTitles: [], companies: [], locations: [], skills: [], dateRanges: [], salaryRanges: [] }, // No specific strong signals
      analysisType: 'search',
      complexity: 'simple',
      confidence: 0.6,
      rawInput: 'find jobs for me'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBe(1); // Expecting only the fallback
    expect(perspectives[0].name).toBe('General Search');
    expect(perspectives[0].approach).toBe('fuzzy_search');
  });

  test('should limit perspectives to a maximum of 3, sorted by confidence', () => {
    // Construct an intent that could trigger many perspectives
    const intent: ParsedIntent = {
      entities: {
        jobTitles: ['manager'],
        skills: ['communication'],
        dateRanges: [{ gte: '2023-01-01' }],
        locations: ['London']
      },
      analysisType: 'search', // This will trigger specific search, skills, location, time-based
      complexity: 'complex',
      confidence: 0.95,
      rawInput: 'manager jobs in London with communication skills since 2023'
    };
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBeLessThanOrEqual(3);
    if (perspectives.length > 1) {
      for (let i = 0; i < perspectives.length - 1; i++) {
        expect(perspectives[i].confidence).toBeGreaterThanOrEqual(perspectives[i+1].confidence);
      }
    }
  });
  
  test('should include multiple relevant perspectives if applicable', () => {
    const intent: ParsedIntent = {
      entities: {
        jobTitles: ['software developer'],
        skills: ['react', 'nodejs'],
        locations: [], companies: [], dateRanges: [], salaryRanges: []
      },
      analysisType: 'search',
      complexity: 'medium',
      confidence: 0.9,
      rawInput: 'software developer react nodejs'
    };
    // This should trigger "Targeted Search" (for jobTitle) AND "Skills-Focused Search"
    const perspectives = perspectiveAgent.generatePerspectives(intent, mockContext);
    expect(perspectives.length).toBeGreaterThanOrEqual(2); // Expecting at least Targeted and Skills-Focused
    expect(perspectives.some(p => p.name === "Targeted Search")).toBe(true);
    expect(perspectives.some(p => p.name === "Skills-Focused Search")).toBe(true);
  });

});

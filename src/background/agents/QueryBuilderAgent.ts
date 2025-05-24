import { LLMClient } from '../services/LLMClient';
import { ParsedIntent, QueryPerspective, AgentContext, AgentLog } from '../../shared/types/agents';
import { ESQuery, SampleQuery, ElasticsearchSchema } from '../../shared/types/elasticsearch'; // Added SampleQuery and ElasticsearchSchema

export class QueryBuilderAgent {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async buildQuery(
    intent: ParsedIntent, 
    perspective: QueryPerspective, 
    context: AgentContext
  ): Promise<ESQuery> {
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
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          query = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON in LLM response');
        }
      }
      
      const enhancedQuery = this.enforceStandardFilters(query);
      const optimizedQuery = this.optimizeQuery(enhancedQuery, intent);
      
      log.output = optimizedQuery;
      log.success = true;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode && context.agentLogs) {
        context.agentLogs.push(log);
      }
      
      return optimizedQuery;
      
    } catch (error: any) {
      log.error = error.message;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode && context.agentLogs) {
        context.agentLogs.push(log);
      }
      
      throw new Error(`Query building failed: ${error.message}`);
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    const schemaProperties = context.schema?.mappings?.properties ?? {};
    return `You are an expert Elasticsearch Query Builder for jobs data.

JOBS INDEX SCHEMA:
${JSON.stringify(schemaProperties, null, 2)}

MANDATORY REQUIREMENTS:
1. Always include: {"term": {"is_deleted.keyword": "0"}}
2. Always include: {"term": {"is_duplicate": false}} 
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
    samples: SampleQuery[]
  ): string {
    const relevantQueries = this.findSimilarQueries(intent, perspective, samples || [], 3);
    
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
    samples: SampleQuery[], 
    limit: number
  ): SampleQuery[] {
    if (!samples) return [];
    const scored = samples.map(sample => {
      let score = 0;
      
      // Entity-based scoring
      if (intent.entities.companies?.length > 0 && sample.tags.includes('company')) score += 3;
      if (intent.entities.locations?.length > 0 && sample.tags.includes('location')) score += 3;
      if (intent.entities.skills?.length > 0 && sample.tags.includes('skills')) score += 3;
      if (intent.entities.jobTitles?.length > 0 && sample.tags.includes('job_title')) score += 3;
      if (intent.entities.dateRanges?.length > 0 && sample.tags.includes('date_range')) score += 2;
      if (intent.entities.salaryRanges?.length > 0 && sample.tags.includes('salary')) score += 2;
      
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
    if (!query.query) {
      query.query = { match_all: {} };
    }
    
    let currentBool = query.query.bool;
    if (!currentBool) {
      // If the original query is not a bool query, wrap it
      currentBool = { must: [query.query] };
    }

    const mandatoryFilters = [
      { term: { 'is_deleted.keyword': '0' } },
      { term: { 'is_duplicate': false } }
    ];

    // Ensure filter array exists and add mandatory filters if not already present
    currentBool.filter = currentBool.filter || [];
    mandatoryFilters.forEach(mf => {
      if (!currentBool.filter.some((f: any) => JSON.stringify(f) === JSON.stringify(mf))) {
        currentBool.filter.push(mf);
      }
    });
    
    return {
      ...query,
      query: { bool: currentBool }
    };
  }

  private optimizeQuery(query: ESQuery, intent: ParsedIntent): ESQuery {
    const optimized = { ...query };
    
    if (!optimized.size && intent.analysisType !== 'aggregation') {
      optimized.size = 50; 
    }
    
    if (intent.complexity === 'complex' && !optimized.timeout) {
      optimized.timeout = '30s';
    }
    
    if (!optimized._source && intent.analysisType === 'search') {
      optimized._source = [
        'job_title',
        'company_name',
        'location',
        // 'standardized_location', // This field was not in the example schema
        'raw_salary',
        'posted_date',
        'url'
      ];
    }
    
    if (intent.analysisType === 'aggregation') {
      optimized.track_total_hits = true;
      optimized.size = 0; 
    }
    
    return optimized;
  }
}

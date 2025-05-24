import { LLMClient } from '../services/LLMClient';
import { ParsedIntent, AgentContext, AgentLog, SampleQuery } from '../../shared/types/agents';
import { ElasticsearchSchema } from '../../shared/types/elasticsearch'; // Added missing import

export class IntentParserAgent {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async parse(userInput: string, context: AgentContext): Promise<ParsedIntent> {
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
      
      if (context.debugMode && context.agentLogs) { // Ensure agentLogs is defined
        context.agentLogs.push(log);
      }
      
      return validated;
      
    } catch (error: any) {
      log.error = error.message;
      log.duration = Date.now() - startTime;
      
      if (context.debugMode && context.agentLogs) { // Ensure agentLogs is defined
        context.agentLogs.push(log);
      }
      
      throw new Error(`Intent parsing failed: ${error.message}`);
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    // Ensure schema and properties are defined before stringifying
    const schemaProperties = context.schema?.mappings?.properties ?? {};
    return `You are an expert Elasticsearch intent parser for a jobs index.

JOBS INDEX SCHEMA:
${JSON.stringify(schemaProperties, null, 2)}

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

  private buildUserPrompt(userInput: string, sampleQueries: SampleQuery[]): string {
    const relevantExamples = this.findRelevantExamples(userInput, sampleQueries || [], 3);
    
    return `USER QUERY: \"${userInput}\"

RELEVANT EXAMPLE PATTERNS:
${relevantExamples.map(ex => `
- Intent: ${ex.userIntent}
- Entities found: ${ex.tags.join(', ')}
- Complexity: ${ex.complexity}
`).join('\\n')}

Extract structured intent from the user query:`;
  }

  private findRelevantExamples(userInput: string, samples: SampleQuery[], limit: number): SampleQuery[] {
    if (!samples) return [];
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
    const normalizations: Record<string, string> = { // Explicitly type normalizations
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
    const normalizations: Record<string, string> = { // Explicitly type normalizations
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'nodejs': 'Node.js',
      'reactjs': 'React'
    };
    
    return normalizations[skill.toLowerCase()] || skill;
  }
}

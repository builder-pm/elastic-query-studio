import { ESQuery, ElasticsearchSchema, SampleQuery } from "./elasticsearch";
import { LLMConfiguration } from "./llm";

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

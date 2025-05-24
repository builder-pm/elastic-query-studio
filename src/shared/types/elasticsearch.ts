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
    properties: Record<string, any>; // Corrected from Record<string, FieldMapping>
  };
  version: string;
  lastUpdated: Date;
  indexName: string;
}

export interface FieldMapping {
  type: 'text' | 'keyword' | 'long' | 'integer' | 'date' | 'boolean' | 'geo_point' | 'nested' | 'object';
  fields?: Record<string, any>; // Corrected from Record<string, FieldMapping>
  properties?: Record<string, any>; // Corrected from Record<string, FieldMapping>
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

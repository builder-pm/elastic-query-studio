import { ElasticsearchSchema } from '../types/elasticsearch';

export const JOBS_INDEX_SCHEMA: ElasticsearchSchema = {
  mappings: {
    properties: {
      // Basic properties, this would be more detailed
      job_title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      company_name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      location: { type: 'text' },
      job_description: { type: 'text' },
      // ... other fields as defined in src/data/jobs-index-schema.json
    }
  },
  version: '7.x', // Example version
  lastUpdated: new Date('2024-01-01T00:00:00Z'),
  indexName: 'jobs'
};

import { AgentLog, PerformanceMetrics, QueryResult } from "./agents"; // Added import

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'debug' | 'system';
  content: string;
  timestamp: Date;
  queryResults?: QueryResult[]; // Corrected: QueryResult was not defined
  metadata?: Record<string, any>; // Corrected: Record was not defined
}

export interface UIState {
  isLoading: boolean;
  currentQuery: string;
  messages: ChatMessage[];
  selectedProvider: string;
  debugMode: boolean;
  settingsOpen: boolean;
  theme: 'light' | 'dark';
}

export interface DebugInfo {
  agentLogs: AgentLog[]; // Corrected: AgentLog was not defined
  performanceMetrics: PerformanceMetrics; // Corrected: PerformanceMetrics was not defined
  cacheHits: Record<string, number>; // Corrected: Record was not defined
  errorDetails?: string;
}

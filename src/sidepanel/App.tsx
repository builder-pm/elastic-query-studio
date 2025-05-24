import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { QueryResult } from '../shared/types/ui'; // Ensure correct import path
// Import other necessary components and types here

const App: React.FC = () => {
  // Basic state and logic placeholders
  const [debugMode, setDebugMode] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Assume connected for now

  const handleQuerySubmit = async (query: string): Promise<QueryResult[]> => {
    console.log("Query submitted to App.tsx:", query);
    // Mock response for now
    // In a real scenario, this would send a message to the background script
    // and wait for QueryResult[]
    return new Promise<QueryResult[]>((resolve) => {
      setTimeout(() => {
        resolve([
          // Mock QueryResult structure
          {
            query: { query: { match_all: {} } }, // ESQuery
            perspective: { id: '1', name: 'Mock Perspective', description: 'A mock query', approach: 'exact_match', reasoning: 'Mocked', confidence: 0.9, estimatedComplexity: 1 },
            validation: { isValid: true, syntaxErrors: [], schemaErrors: [], performanceWarnings: [], securityIssues: [], score: 90, recommendations: [] },
            reasoning: 'This is a mock result',
            complexity: 1,
            // Ensure estimatedPerformance is present if QueryResult expects it
            estimatedPerformance: { complexityScore: 1, optimizationSuggestions: [] }, 
            agentLogs: [] // AgentLog[]
          }
        ]);
      }, 1000);
    });
  };

  // Effect to listen for messages from background script (e.g., for debug mode changes)
  useEffect(() => {
    const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === "DEBUG_MODE_UPDATED") {
        setDebugMode(message.payload.debugMode);
      }
      // Potentially handle other messages like connection status
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#333' }}>
      <header style={{ backgroundColor: '#f0f0f0', padding: '12px 15px', borderBottom: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '1.4em' }}>Elasticsearch Query Helper</h1>
      </header>
      <main style={{ flexGrow: 1, overflowY: 'auto', padding: '15px' }}>
        <ChatInterface 
          onQuerySubmit={handleQuerySubmit} 
          debugMode={debugMode} 
          isConnected={isConnected} 
        />
      </main>
      <footer style={{ backgroundColor: '#f0f0f0', padding: '8px 15px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '0.85em' }}>
        {/* Footer content, e.g., settings button, status */}
        <p style={{margin: 0}}>Status: {isConnected ? 'Connected' : 'Disconnected'} | Debug: {debugMode ? 'On' : 'Off'}</p>
        {/* Add a button to toggle debug mode for example */}
        <button onClick={() => setDebugMode(!debugMode)} style={{marginLeft: '10px', padding: '3px 8px', fontSize: '0.9em'}}>
          Toggle Debug
        </button>
      </footer>
    </div>
  );
};

export default App;

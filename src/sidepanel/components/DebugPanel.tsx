import React from 'react';
import { AgentLog } from '../../shared/types/agents'; // Assuming AgentLog type will be needed

interface DebugPanelProps {
  agentLogs: AgentLog[];
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ agentLogs, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 shadow-lg p-4 max-h-1/2 overflow-y-auto"
      style={{ zIndex: 1000 }} // Ensure it's above other content
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-lg text-gray-800 dark:text-white">Debug Panel - Agent Logs</h4>
        <button 
          onClick={onClose} 
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
           {/* Using a simple 'X' for close button, Lucide icon can be used here too */}
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
      
      {agentLogs && agentLogs.length > 0 ? (
        <div className="space-y-3 text-xs">
          {agentLogs.map((log, index) => (
            <details key={index} className="bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm">
              <summary className="font-medium cursor-pointer text-gray-700 dark:text-gray-200">
                <span className="font-bold text-blue-600 dark:text-blue-400">[{log.agent}]</span> {log.action} - 
                <span className={log.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {log.success ? 'Success' : 'Failed'}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">({log.duration}ms)</span>
              </summary>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {log.input && (
                  <div className="mb-1.5">
                    <strong className="text-gray-600 dark:text-gray-300">Input:</strong>
                    <pre className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-all">
                      {typeof log.input === 'object' ? JSON.stringify(log.input, null, 2) : String(log.input)}
                    </pre>
                  </div>
                )}
                {log.output && (
                  <div className="mb-1.5">
                    <strong className="text-gray-600 dark:text-gray-300">Output:</strong>
                    <pre className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-all">
                      {typeof log.output === 'object' ? JSON.stringify(log.output, null, 2) : String(log.output)}
                    </pre>
                  </div>
                )}
                {log.error && (
                  <div>
                    <strong className="text-red-600 dark:text-red-400">Error:</strong>
                    <pre className="bg-red-50 dark:bg-red-800 p-1.5 rounded text-red-700 dark:text-red-200 whitespace-pre-wrap break-all">
                      {log.error}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No agent logs available for this session yet.</p>
      )}
    </div>
  );
};

export default DebugPanel;

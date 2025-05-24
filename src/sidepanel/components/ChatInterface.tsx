import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, QueryResult } from '../../shared/types/ui'; // Adjusted import path
import { QueryOptionCard } from './QueryOptionCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Send, RotateCcw } from 'lucide-react';

interface ChatInterfaceProps {
  onQuerySubmit: (query: string) => Promise<QueryResult[]>; // Corrected to use QueryResult[]
  debugMode: boolean;
  isConnected: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ // Added ChatInterfaceProps
  onQuerySubmit, 
  debugMode,
  isConnected 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Typed state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null); // Typed ref
  const inputRef = useRef<null | HTMLInputElement>(null); // Typed ref

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isConnected) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const results = await onQuerySubmit(inputValue.trim());
      
      if (results && results.length > 0) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `Generated ${results.length} query option${results.length > 1 ? 's' : ''}:`,
          timestamp: new Date(),
          queryResults: results
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'error',
          content: 'No valid queries could be generated. Please try rephrasing your request.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) { // Typed error
      console.error('Query generation error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `Error: ${error.message || 'Failed to generate query. Please check your LLM configuration.'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const exampleQueries = [
    "Find software engineer jobs in San Francisco",
    "Show me remote jobs requiring Python",
    "Jobs at Google or Microsoft posted last week",
    "Count jobs by company in Germany"
  ];

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header - Can be part of App.tsx or a separate component */}
      {/* <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Elasticsearch Query Helper</h2>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {messages.length > 0 && (
            <button onClick={clearMessages} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div> */}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <h3 className="text-xl font-semibold mb-2">Welcome!</h3>
            <p className="mb-6">Describe what you're looking for, or try an example:</p>
            <div className="space-y-2 max-w-md mx-auto">
              {exampleQueries.map((example, index) => (
                <button 
                  key={index} 
                  onClick={() => handleExampleClick(example)}
                  className="block w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} debugMode={debugMode} />
        ))}
        
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Processing your request...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isConnected ? "Describe what you're looking for..." : "Configure LLM provider in settings first"}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-60"
            disabled={isLoading || !isConnected}
            maxLength={500}
          />
          <button 
            type="submit" 
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            disabled={isLoading || !inputValue.trim() || !isConnected}
          >
            <Send size={20} />
          </button>
        </div>
        {inputValue.length > 400 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {500 - inputValue.length} characters remaining
          </p>
        )}
      </form>
    </div>
  );
};

interface MessageBubbleProps { // Added interface for MessageBubble props
  message: ChatMessage;
  debugMode: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, debugMode }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  // const isSystem = message.type === 'system'; // Not used in current styling
  
  const baseBubbleClasses = "p-3 rounded-lg max-w-xl break-words";
  const userBubbleClasses = "bg-blue-500 text-white self-end ml-auto";
  const assistantBubbleClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white self-start";
  const errorBubbleClasses = "bg-red-100 dark:bg-red-700 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-100 self-start";
  const debugBubbleClasses = "bg-yellow-100 dark:bg-yellow-700 border border-yellow-300 dark:border-yellow-500 text-yellow-700 dark:text-yellow-100 self-start text-xs";

  let bubbleClass = "";
  if (message.type === 'user') bubbleClass = `${baseBubbleClasses} ${userBubbleClasses}`;
  else if (message.type === 'assistant') bubbleClass = `${baseBubbleClasses} ${assistantBubbleClasses}`;
  else if (message.type === 'error') bubbleClass = `${baseBubbleClasses} ${errorBubbleClasses}`;
  else if (message.type === 'debug' && debugMode) bubbleClass = `${baseBubbleClasses} ${debugBubbleClasses}`;
  else if (message.type === 'system') bubbleClass = "text-center text-xs text-gray-500 dark:text-gray-400 py-2"; // System messages styled differently
  else if (message.type === 'debug' && !debugMode) return null; // Don't render debug messages if debugMode is off


  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={bubbleClass}>
        {typeof message.content === 'string' ? message.content.split('\\n').map((line, i) => <div key={i}>{line}</div>) : JSON.stringify(message.content)}
        
        {message.queryResults && message.queryResults.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.queryResults.map((result, index) => (
              <QueryOptionCard key={index} queryResult={result} index={index} />
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { QueryResult } from '../../shared/types/ui'; // Assuming QueryResult type will be needed
import QueryDisplay from './QueryDisplay'; // Assuming QueryDisplay component will be used

interface QueryOptionCardProps {
  queryResult: QueryResult;
  index: number; // To differentiate if multiple cards are shown
  onSelect?: (queryResult: QueryResult) => void; // Optional: if cards are selectable
}

const QueryOptionCard: React.FC<QueryOptionCardProps> = ({ queryResult, index, onSelect }) => {
  const { query, perspective, validation, reasoning } = queryResult;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="mb-3">
        <h4 className="font-semibold text-md text-blue-600 dark:text-blue-400">
          Option {index + 1}: {perspective?.name || 'Generated Query'}
        </h4>
        {perspective?.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{perspective.description}</p>
        )}
      </div>

      {validation && (
        <div className={`mb-3 p-2 rounded-md text-xs ${validation.isValid ? 'bg-green-50 dark:bg-green-800 border border-green-200 dark:border-green-600' : 'bg-red-50 dark:bg-red-800 border border-red-200 dark:border-red-600'}`}>
          <p className={`font-medium ${validation.isValid ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
            Validation: {validation.isValid ? `Valid (Score: ${validation.score})` : `Invalid (Score: ${validation.score})`}
          </p>
          {!validation.isValid && validation.syntaxErrors?.length > 0 && (
            <ul className="list-disc list-inside mt-1">
              {validation.syntaxErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}
      
      {reasoning && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 italic">
          <strong>Reasoning:</strong> {reasoning}
        </p>
      )}

      <QueryDisplay query={query} />

      {onSelect && (
        <button 
          onClick={() => onSelect(queryResult)}
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md transition-colors"
        >
          Use this Query
        </button>
      )}
    </div>
  );
};

export default QueryOptionCard;

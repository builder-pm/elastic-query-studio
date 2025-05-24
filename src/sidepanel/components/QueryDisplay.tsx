import React from 'react';
import { ESQuery } from '../../shared/types/elasticsearch'; // Assuming ESQuery type will be needed

interface QueryDisplayProps {
  query: ESQuery;
  language?: string; // e.g., 'json'
}

const QueryDisplay: React.FC<QueryDisplayProps> = ({ query, language = 'json' }) => {
  const queryString = JSON.stringify(query, null, 2);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
      <pre className="whitespace-pre-wrap break-all">
        <code className={`language-${language}`}>
          {queryString}
        </code>
      </pre>
    </div>
  );
};

export default QueryDisplay;

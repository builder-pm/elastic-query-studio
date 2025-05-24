# API Documentation

This document outlines the API specifications for the Elasticsearch Query Helper AI Chrome Extension.

## Background Script API

The background script (`background.ts`) exposes functionality to the side panel UI via `chrome.runtime.sendMessage`.

### Message Types

#### 1. `PROCESS_QUERY`
   - **Direction**: Side Panel -> Background
   - **Payload**: 
     ```json
     {
       "userInput": "string" 
     }
     ```
   - **Response**: 
     ```json
     {
       "data": {
         "allResults": "QueryResult[]", // Array of ranked query options
         "bestResult": "QueryResult | null", // The top-ranked query result
         "agentLogs": "AgentLog[]" // If debug mode is enabled
       },
       // OR
       "error": "string" // Error message if processing failed
     }
     ```
   - **Description**: Initiates the multi-agent pipeline to process the user's natural language input and generate Elasticsearch queries.

#### 2. `UPDATE_LLM_CONFIG`
   - **Direction**: Side Panel -> Background
   - **Payload**: *(No explicit payload, background script reads from `chrome.storage`)*
     Implicitly, the side panel should have saved new configuration to `chrome.storage.local` using `StorageManager` via its hooks before sending this message.
   - **Response**:
     ```json
     {
       "success": "boolean",
       "message": "string" // Optional message
       // OR
       "error": "string"
     }
     ```
   - **Description**: Notifies the background script that LLM configuration (provider, model, API key, etc.) has been updated in storage. The background script should re-initialize its `AgentOrchestrator` and `LLMClient` with the new settings.

#### 3. `UPDATE_DEBUG_MODE`
    - **Direction**: Side Panel -> Background
    - **Payload**: *(No explicit payload, background script reads from `chrome.storage`)*
      Implicitly, the side panel should have saved the new debug mode state to `chrome.storage.local` before sending this message.
    - **Response**:
      ```json
      {
        "success": "boolean",
        "message": "string" // Optional message
        // OR
        "error": "string"
      }
      ```
    - **Description**: Notifies the background script that the debug mode has been updated in storage. The background script should update its internal debug mode state.
---

*More message types to be added as features are developed (e.g., `GET_SETTINGS`, `TEST_LLM_CONNECTION`).*

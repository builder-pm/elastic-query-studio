// Main background service worker

console.log("Background service worker started");

// Listener for messages from the side panel or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.type === "PROCESS_QUERY") {
    // Placeholder: Simulate processing and send a response
    setTimeout(() => {
      sendResponse({ 
        data: { 
          allResults: [], 
          bestResult: null, 
          agentLogs: [] 
        },
        message: "Query processed (placeholder)" 
      });
    }, 1000);
    return true; // Indicates that the response will be sent asynchronously
  } else if (request.type === "UPDATE_LLM_CONFIG") {
    // Placeholder: Simulate config update
    console.log("LLM config update requested.");
    sendResponse({ success: true, message: "LLM Config updated (placeholder)" });
    return false; 
  } else if (request.type === "UPDATE_DEBUG_MODE") {
    // Placeholder: Simulate debug mode update
    console.log("Debug mode update requested.");
    sendResponse({ success: true, message: "Debug mode updated (placeholder)" });
    return false;
  }
  // Add other message handlers here
});

// Open the side panel on extension icon click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

console.log("Background service worker event listeners registered.");

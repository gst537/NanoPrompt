// NanoPrompt Background Service Worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "COMPRESS") {
    // Perform the fetch request here to bypass mixed-content blocks
    // since the background script has its own security context.
    fetch(request.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: request.text,
        type: request.type
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      console.error("NanoPrompt Background Fetch Error:", error);
      sendResponse({ success: false, error: error.message });
    });

// Return true to indicate we will respond asynchronously
    return true;
  }
});

// ─── Context Menu ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "nanoprompt-compress",
    title: "Compress with NanoPrompt",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "nanoprompt-compress" && info.selectionText) {
    // Compress the selected text
    fetch("http://localhost:8000/api/v1/compress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: info.selectionText,
        type: "auto"
      })
    })
    .then(response => {
      if (!response.ok) throw new Error("Compression failed");
      return response.json();
    })
    .then(data => {
      // Send message to content script to copy to clipboard (background scripts cannot write to clipboard directly)
      chrome.tabs.sendMessage(tab.id, {
        action: "COPY_TO_CLIPBOARD",
        text: data.compressed_content,
        savings: data.savings_usd
      });
    })
    .catch(error => {
      console.error("NanoPrompt Context Menu Error:", error);
    });
  }
});

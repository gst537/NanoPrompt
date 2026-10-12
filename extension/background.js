// NanoPrompt Background Service Worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "HEATMAP") {
    const baseUrl = request.apiUrl ? request.apiUrl.replace(/\/compress\/?$/, "") : "http://localhost:8000/api/v1";
    const heatmapUrl = baseUrl.endsWith("/api/v1") ? `${baseUrl}/heatmap` : `${baseUrl}/api/v1/heatmap`;

    fetch(heatmapUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: request.text })
    })
    .then(r => {
      if (!r.ok) throw new Error(`API Error: ${r.status}`);
      return r.json();
    })
    .then(data => sendResponse({ success: true, data: data }))
    .catch(err => {
      const msg = err.message === "Failed to fetch" 
        ? "Cannot connect to NanoPrompt backend (localhost:8000). Ensure the backend server is running." 
        : err.message;
      console.error("NanoPrompt Background Heatmap Error:", msg);
      sendResponse({ success: false, error: msg });
    });
    return true;
  }

  if (request.action === "COMPRESS") {
    const targetUrl = request.apiUrl || "http://localhost:8000/api/v1/compress";
    fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: request.text,
        type: request.type || "auto"
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
      const msg = error.message === "Failed to fetch"
        ? "Cannot connect to NanoPrompt backend (localhost:8000). Ensure the backend server is running."
        : error.message;
      console.error("NanoPrompt Background Fetch Error:", msg);
      sendResponse({ success: false, error: msg });
    });

    return true;
  }
});

// ─── Shared Logic for Compression & Clipboard ────────────────────────────────
function performCompressionAndCopy(tabId, textToCompress) {
  fetch("http://localhost:8000/api/v1/compress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: textToCompress,
      type: "auto"
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Compression failed");
    return response.json();
  })
  .then(data => {
    const compressedText = data.compressed_text;
    const savings = data.stats.savings_usd;
    
    // Inject script to copy to clipboard on the active tab
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (textToCopy, savedAmount) => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(textToCopy)
            .then(() => console.log(`NanoPrompt: Compressed & copied! Saved ₹${savedAmount.toFixed(4)}`))
            .catch(err => {
              console.error("Clipboard API failed:", err);
              // Fallback for older browsers
              const el = document.createElement('textarea');
              el.value = textToCopy;
              document.body.appendChild(el);
              el.select();
              document.execCommand('copy');
              document.body.removeChild(el);
            });
        } else {
          // Fallback if navigator.clipboard is unavailable
          const el = document.createElement('textarea');
          el.value = textToCopy;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
          console.log(`NanoPrompt: Compressed & copied (Fallback)! Saved ₹${savedAmount.toFixed(4)}`);
        }
      },
      args: [compressedText, savings]
    });
  })
  .catch(error => {
    console.error("NanoPrompt Background Error:", error);
  });
}

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
    performCompressionAndCopy(tab.id, info.selectionText);
  }
});

// ─── Keyboard Shortcuts ────────────────────────────────────────────────────

chrome.commands.onCommand.addListener((command) => {
  if (command === "compress-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const tabId = tabs[0].id;
      
      // Inject a script to get the currently selected text
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => window.getSelection().toString()
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const selectionText = results[0].result;
          performCompressionAndCopy(tabId, selectionText);
        }
      });
    });
  }
});

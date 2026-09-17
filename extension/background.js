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

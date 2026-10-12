// NanoPrompt Content Script

// Helper to find the active LLM chat input box
function findInputBox() {
  if (window.location.hostname.includes("chatgpt.com")) {
    return document.querySelector('#prompt-textarea');
  } else if (window.location.hostname.includes("claude.ai")) {
    return document.querySelector('div[contenteditable="true"].ProseMirror');
  }
  return null;
}

// Function to call local NanoPrompt API via Background Script
async function compressText(text, type, apiUrl) {
  if (!chrome.runtime?.id) {
    console.warn("NanoPrompt: Extension context invalidated. Please refresh the page.");
    return null;
  }
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({
        action: "COMPRESS",
        text: text,
        type: type,
        apiUrl: apiUrl
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("NanoPrompt compression error:", chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        if (response && response.success) {
          resolve(response.data);
        } else {
          console.error("NanoPrompt compression failed:", response ? response.error : "Unknown error");
          resolve(null);
        }
      });
    } catch (err) {
      console.warn("NanoPrompt: Failed to send COMPRESS message:", err.message);
      resolve(null);
    }
  });
}

async function getHeatmap(text) {
  if (!chrome.runtime?.id) {
    console.warn("NanoPrompt: Extension context invalidated. Please refresh the page.");
    return null;
  }
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({
        action: "HEATMAP",
        text: text
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("NanoPrompt heatmap error:", chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        if (response && response.success) {
          resolve(response.data.tokens);
        } else {
          resolve(null);
        }
      });
    } catch (err) {
      console.warn("NanoPrompt: Failed to send HEATMAP message:", err.message);
      resolve(null);
    }
  });
}

// Store the original text to allow undo
let originalTextCache = "";
let lastCompressedText = "";

// Inject UI into the page
function injectUI() {
  const inputBox = findInputBox();
  if (!inputBox) return false;

  // Check if already injected anywhere on the page
  if (document.querySelector('.nanoprompt-row')) {
    return true;
  }

  // Ensure parent has relative positioning for absolute child
  const wrapper = inputBox.parentElement;
  wrapper.style.position = "relative";

  const ui = createNanoPromptUI(
    // onCompressClick
    async (selectedType) => {
      // Get the current text
      if (inputBox.tagName.toLowerCase() === 'textarea') {
        originalTextCache = inputBox.value;
      } else {
        originalTextCache = inputBox.innerText;
      }

      if (!originalTextCache.trim()) return false;

      // Get API URL from storage
      return new Promise((resolve) => {
        if (!chrome.runtime?.id) {
          alert("NanoPrompt extension was reloaded or updated. Please refresh the page.");
          resolve(false);
          return;
        }
        try {
          chrome.storage.sync.get({ apiUrl: "http://localhost:8000/api/v1/compress" }, async (data) => {
            if (chrome.runtime.lastError) {
              console.warn("NanoPrompt storage error:", chrome.runtime.lastError.message);
            }
            const apiUrl = data?.apiUrl || "http://localhost:8000/api/v1/compress";
            const result = await compressText(originalTextCache, selectedType, apiUrl);
            
            if (result) {
              lastCompressedText = result.compressed_text;
              // Replace text
              inputBox.focus();
              if (inputBox.tagName.toLowerCase() === 'textarea') {
                inputBox.select();
                document.execCommand('insertText', false, result.compressed_text);
              } else {
                // Content editable (ChatGPT/Claude)
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, result.compressed_text);
              }
              
              // Show stats toast
              ui.showToast(result.stats.savings_usd, result.stats.tokens_saved);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } catch (err) {
          console.warn("NanoPrompt storage access error:", err.message);
          resolve(false);
        }
      });
    },
    // onUndoClick
    (clearOverlayOnly) => {
      const existingOverlay = inputBox.parentElement.querySelector('.nanoprompt-ghost-overlay');
      if (existingOverlay) existingOverlay.remove();
      if (clearOverlayOnly === true) return;

      if (!originalTextCache) return;
      
      inputBox.focus();
      if (inputBox.tagName.toLowerCase() === 'textarea') {
        inputBox.select();
        document.execCommand('insertText', false, originalTextCache);
      } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, originalTextCache);
      }
      
      originalTextCache = ""; // Clear cache after undo
    },
    // onHeatmapClick
    async () => {
      const currentText = inputBox.tagName.toLowerCase() === 'textarea' ? inputBox.value : inputBox.innerText;
      if (!currentText.trim()) return false;
      
      const tokens = await getHeatmap(currentText);
      if (!tokens) return false;
      
      const existingOverlay = inputBox.parentElement.querySelector('.nanoprompt-ghost-overlay');
      if (existingOverlay) existingOverlay.remove();

      const overlay = document.createElement('div');
      overlay.className = 'nanoprompt-ghost-overlay';
      
      // Anchor directly to the rendered text element (Claude ProseMirror <p> or the input container)
      const targetEl = inputBox.querySelector('p') || inputBox;
      const rect = targetEl.getBoundingClientRect();
      const parentRect = inputBox.parentElement.getBoundingClientRect();

      overlay.style.position = 'absolute';
      overlay.style.top = `${rect.top - parentRect.top}px`;
      overlay.style.left = `${rect.left - parentRect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.boxSizing = 'border-box';
      overlay.style.margin = '0';

      // Copy longhand computed styles directly to avoid empty shorthand bugs in Chrome
      const cs = window.getComputedStyle(targetEl);
      overlay.style.fontFamily = cs.fontFamily;
      overlay.style.fontSize = cs.fontSize;
      overlay.style.fontWeight = cs.fontWeight;
      overlay.style.fontStyle = cs.fontStyle;
      overlay.style.lineHeight = cs.lineHeight;
      overlay.style.letterSpacing = cs.letterSpacing;
      overlay.style.wordSpacing = cs.wordSpacing;
      overlay.style.textAlign = cs.textAlign;
      overlay.style.textIndent = cs.textIndent;
      overlay.style.textTransform = cs.textTransform;
      overlay.style.whiteSpace = cs.whiteSpace || 'pre-wrap';
      overlay.style.wordBreak = cs.wordBreak || 'break-word';
      overlay.style.overflowWrap = cs.overflowWrap || 'break-word';
      overlay.style.paddingTop = cs.paddingTop;
      overlay.style.paddingRight = cs.paddingRight;
      overlay.style.paddingBottom = cs.paddingBottom;
      overlay.style.paddingLeft = cs.paddingLeft;
      
      tokens.forEach(t => {
        const rawWord = t.word || '';
        // Separate actual word text from trailing/leading whitespace so spaces aren't painted
        const match = rawWord.match(/^(\s*)(.*?)(\s*)$/s);
        const leadingWs = match ? match[1] : '';
        const wordText = match ? match[2] : rawWord;
        const trailingWs = match ? match[3] : '';

        if (leadingWs) {
          overlay.appendChild(document.createTextNode(leadingWs));
        }

        if (wordText) {
          const weight = t.weight;
          
          if (weight >= 0.7) {
            // Only highlight key signal words that the AI considers important (Clean Green)
            const span = document.createElement('span');
            span.textContent = wordText;
            span.className = 'nanoprompt-token-highlight';
            overlay.appendChild(span);
          } else {
            // Conversational filler, stop words, and syntax are left unhighlighted (clean text)
            overlay.appendChild(document.createTextNode(wordText));
          }
        }

        if (trailingWs) {
          overlay.appendChild(document.createTextNode(trailingWs));
        }
      });

      overlay.scrollTop = inputBox.scrollTop;
      inputBox.addEventListener('scroll', () => {
        overlay.scrollTop = inputBox.scrollTop;
      }, { passive: true });

      inputBox.parentElement.appendChild(overlay);
      return true;
    }
  );

  // Use a MutationObserver to detect text changes instead of 'input' events
  // because ProseMirror (Claude) intercepts or swallows standard input events.
  const inputObserver = new MutationObserver(() => {
    if (!chrome.runtime?.id) {
      inputObserver.disconnect();
      return;
    }
    if (originalTextCache) {
      const currentText = inputBox.tagName.toLowerCase() === 'textarea' ? inputBox.value : inputBox.textContent;
      
      // If the user clears the box (by submitting) or types something new, reset
      if (currentText.trim() === "" || (currentText !== originalTextCache && currentText !== lastCompressedText)) {
        ui.resetState();
        originalTextCache = "";
        lastCompressedText = "";
      }
    }
  });

  inputObserver.observe(inputBox, { characterData: true, childList: true, subtree: true });

  // Find the outermost chatbox container to ensure we don't overlap text
  let outerContainer = inputBox.parentElement;
  if (window.location.hostname.includes("claude.ai")) {
    outerContainer = inputBox.closest('fieldset') || inputBox.closest('.flex.flex-col') || inputBox.parentElement.parentElement.parentElement;
  } else if (window.location.hostname.includes("chatgpt.com")) {
    outerContainer = inputBox.closest('form') || inputBox.parentElement.parentElement.parentElement;
  }

  // Inject a dedicated row below the entire chatbox
  const row = document.createElement('div');
  row.className = 'nanoprompt-row';
  row.style.display = 'flex';
  row.style.justifyContent = 'flex-end';
  row.style.width = '100%';
  row.style.marginTop = '8px';
  row.style.paddingRight = '8px'; 
  
  row.appendChild(ui.container);

  if (outerContainer && outerContainer.parentElement) {
    outerContainer.parentElement.insertBefore(row, outerContainer.nextSibling);
  } else {
    inputBox.parentElement.appendChild(row);
  }
  
  return true;
}

// Mutation observer to detect when chat input is added to the DOM (SPAs)
const observer = new MutationObserver(() => {
  if (!chrome.runtime?.id) {
    observer.disconnect();
    return;
  }
  injectUI();
});

observer.observe(document.body, { childList: true, subtree: true });

// Try initial injection
setTimeout(() => {
  if (chrome.runtime?.id) {
    injectUI();
  }
}, 1000);

// Listen for messages from background script (e.g. Context Menu actions)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "COPY_TO_CLIPBOARD") {
    // We create a temporary textarea to hold the text, copy it, then remove it
    const el = document.createElement('textarea');
    el.value = request.text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    // Optionally alert or show a minimal toast to the user
    console.log(`NanoPrompt: Compressed & copied to clipboard! Saved ₹${request.savings}`);
    // If our UI is injected, we can try to use its toast, but it might not be.
    // A simple native alert is too intrusive, so console log is best.
    
    sendResponse({ success: true });
  }
});

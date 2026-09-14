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
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: "COMPRESS",
      text: text,
      type: type,
      apiUrl: apiUrl
    }, (response) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        console.error("NanoPrompt compression failed:", response ? response.error : chrome.runtime.lastError);
        resolve(null);
      }
    });
  });
}

// Store the original text to allow undo
let originalTextCache = "";

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
        chrome.storage.sync.get({ apiUrl: "http://localhost:8000/api/v1/compress" }, async (data) => {
          const result = await compressText(originalTextCache, selectedType, data.apiUrl);
          
          if (result) {
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
      });
    },
    // onUndoClick
    () => {
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
    }
  );

  // If user edits the text manually after compression, reset the UI state
  inputBox.addEventListener("input", () => {
    if (originalTextCache && 
        ((inputBox.tagName.toLowerCase() === 'textarea' && inputBox.value !== originalTextCache) || 
         (inputBox.tagName.toLowerCase() !== 'textarea' && inputBox.textContent !== originalTextCache))) {
      // The text changed
    }
  });

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
  injectUI();
});

observer.observe(document.body, { childList: true, subtree: true });

// Try initial injection
setTimeout(injectUI, 1000);

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

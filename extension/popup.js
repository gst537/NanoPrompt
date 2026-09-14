// NanoPrompt Settings & Scratchpad Logic

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("apiUrl");
  const saveBtn = document.getElementById("saveBtn");
  
  const promptInput = document.getElementById("promptInput");
  const typeSelect = document.getElementById("typeSelect");
  const compressBtn = document.getElementById("compressBtn");
  const copyBtn = document.getElementById("copyBtn");
  const statsToast = document.getElementById("statsToast");

  let currentApiUrl = "http://localhost:8000/api/v1/compress";

  // Load existing setting
  chrome.storage.sync.get({ apiUrl: currentApiUrl }, (data) => {
    currentApiUrl = data.apiUrl;
    let displayUrl = data.apiUrl;
    if (displayUrl.endsWith("/api/v1/compress")) {
      displayUrl = displayUrl.replace("/api/v1/compress", "");
    }
    urlInput.value = displayUrl;
  });

  // Save new setting
  saveBtn.addEventListener("click", () => {
    let baseUrl = urlInput.value.trim();
    if (!baseUrl) {
      baseUrl = "http://localhost:8000";
    }
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    currentApiUrl = `${baseUrl}/api/v1/compress`;

    chrome.storage.sync.set({ apiUrl: currentApiUrl }, () => {
      saveBtn.textContent = "SAVED";
      setTimeout(() => {
        saveBtn.textContent = "SAVE";
      }, 2000);
    });
  });

  // Handle Compression
  compressBtn.addEventListener("click", () => {
    const text = promptInput.value;
    if (!text.trim()) return;

    compressBtn.textContent = "PROCESSING...";
    compressBtn.classList.add("loading");

    chrome.runtime.sendMessage({
      action: "COMPRESS",
      text: text,
      type: typeSelect.value,
      apiUrl: currentApiUrl
    }, (response) => {
      compressBtn.classList.remove("loading");
      compressBtn.textContent = "⚡ COMPRESS";

      if (response && response.success) {
        promptInput.value = response.data.compressed_text;
        statsToast.textContent = `⚡ SAVED: $${response.data.stats.savings_usd.toFixed(4)} (${response.data.stats.tokens_saved} TOKENS)`;
        
        // Show copy button
        copyBtn.style.display = "block";
        compressBtn.style.flex = "1";
      } else {
        statsToast.textContent = "❌ COMPRESSION FAILED (CHECK API)";
        statsToast.style.color = "#ef4444";
      }
    });
  });

  // Handle Copy
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(promptInput.value).then(() => {
      copyBtn.textContent = "📋 COPIED";
      copyBtn.style.color = "var(--accent-acid)";
      copyBtn.style.borderColor = "var(--accent-acid)";
      
      setTimeout(() => {
        copyBtn.textContent = "📋 COPY";
        copyBtn.style.color = "var(--text-primary)";
        copyBtn.style.borderColor = "var(--border-subtle)";
      }, 2000);
    });
  });

  // Reset UI on input
  promptInput.addEventListener("input", () => {
    copyBtn.style.display = "none";
    compressBtn.style.flex = "2";
    statsToast.textContent = "";
    statsToast.style.color = "var(--accent-acid)";
  });
});

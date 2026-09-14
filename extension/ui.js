// NanoPrompt Chrome Extension UI Components

function createNanoPromptUI(onCompressClick, onUndoClick) {
  const container = document.createElement("div");
  container.className = "nanoprompt-container";

  // Toast
  const toast = document.createElement("div");
  toast.className = "nanoprompt-toast";
  toast.innerHTML = `<span>⚡ SAVED:</span> <span class="nanoprompt-toast-saved">₹0.00 (0 TOKENS)</span>`;

  // Type Selector Dropdown
  const select = document.createElement("select");
  select.className = "nanoprompt-select";
  const options = [
    { value: "auto", text: "AUTO" },
    { value: "code", text: "CODE" },
    { value: "text", text: "TEXT" },
    { value: "json", text: "JSON" }
  ];
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    select.appendChild(option);
  });

  // Button
  const btn = document.createElement("button");
  btn.className = "nanoprompt-btn";
  btn.innerHTML = "⚡ COMPRESS";
  
  // State: IDLE, COMPRESSING, COMPRESSED
  let currentState = "IDLE";

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentState === "COMPRESSED") {
      // Handle Undo
      onUndoClick();
      btn.classList.remove("undo");
      btn.innerHTML = "⚡ COMPRESS";
      select.style.display = "block";
      currentState = "IDLE";
      return;
    }
    
    if (currentState === "IDLE") {
      // Set loading state
      currentState = "COMPRESSING";
      btn.classList.add("loading");
      btn.innerHTML = "PROCESSING...";
      select.style.display = "none";
      
      const type = select.value;
      const success = await onCompressClick(type);
      
      if (success) {
        // Switch to Undo state
        currentState = "COMPRESSED";
        btn.classList.remove("loading");
        btn.classList.add("undo");
        btn.innerHTML = "↺ UNDO";
      } else {
        // Reset to Idle on failure
        currentState = "IDLE";
        btn.classList.remove("loading");
        btn.innerHTML = "⚡ COMPRESS";
        select.style.display = "block";
      }
    }
  });

  container.appendChild(toast);
  container.appendChild(select);
  container.appendChild(btn);

  return {
    container,
    button: btn,
    showToast: (usd, tokens) => {
      const savedSpan = toast.querySelector(".nanoprompt-toast-saved");
      savedSpan.textContent = `₹${usd.toFixed(4)} (${tokens} TOKENS)`;
      toast.classList.add("show");
      
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4000);
    },
    resetState: () => {
      currentState = "IDLE";
      btn.classList.remove("undo", "loading");
      btn.innerHTML = "⚡ COMPRESS";
      select.style.display = "block";
    }
  };
}

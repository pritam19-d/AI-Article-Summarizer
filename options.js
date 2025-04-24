document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["geminiApiKey"], (result) => {
    if (result?.geminiApiKey) {
      document.getElementById("apiKey").value = result.geminiApiKey;
    };

    document.getElementById("saveBtn").addEventListener("click", () => {
      const apiKey = document.getElementById("apiKey").value.trim();

      if (apiKey) {
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
          document.getElementById("successMessage").style.display = "block";
          setTimeout(() => {
            window.close();
            chrome.tabs.getCurrent((tab) => {
              tab && chrome.tabs.remove(tab.id);
            });
          }, 1200);
        })
      }
    });
  });
});
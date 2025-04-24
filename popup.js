document.getElementById("summarize").addEventListener("click", () => {
	const resultDiv = document.getElementById("result");
	const summaryType = document.getElementById("summaryType").value;
	resultDiv.innerHTML = "<div class='loader'></div>";

	chrome.storage.sync.get(["geminiApiKey"], ({geminiApiKey}) => {
    console.log("Gemini API Key:", geminiApiKey);
    
		if (!geminiApiKey) {
			resultDiv.innerHTML =
				"Please set your Gemini API key in the options page.";
			return;
		}

		chrome.tabs.query({ active: true, currentWindow: true }, ([tabs]) => {
			chrome.tabs.sendMessage(
				tabs.id,
				{ type: "GET_ARTICLE_TEXT" },
				async (res) => {
					if ( !res || !res.text ) {
						resultDiv.innerHTML = "No article text found. Please try again.";
						return;
					}
					try {
						const summary = await getGeminiSummary(
							res.text,
              summaryType,
              geminiApiKey
						);
						resultDiv.textContent = summary;
					} catch (err) {
						resultDiv.textContent = "Gemini Error: " + err.message;
					}
				}
			);
		});
	});
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;

  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copyBtn");
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "Copied!";
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

async function getGeminiSummary(rawText, type, apiKey) {
	const text =
		rawText.length > 20000 ? rawText.slice(0, 20000) + "..." : rawText;

	const promptMap = {
		brief: `Summarize the following text in 2-3 sentences:\n\n${text}`,
		detailed: `Give a detailed summary the following text:\n\n${text}`,
		bullets: `Summarize the following text in bullet points (start each line with a "-"):\n\n${text}`,
		question: `Summarize the following text in a question and answer format:\n\n${text}`,
	};

	const prompt = promptMap[type] || promptMap.brief;

	try {
		const res = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: prompt }] }],
				}),
			}
		);

		if (!res.ok) {
			const { error } = await res.json();
			throw new Error(
				error.message || "Error fetching summary from Gemini API."
			);
		}

		const data = await res.json();
		return (
			data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary found."
		);
	} catch (err) {
    console.error("Error fetching summary:", err);
    throw new Error("Error fetching summary from Gemini API.");
  }
}

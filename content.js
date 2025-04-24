// This script runs in the context of the web page and can access the DOM
function getArticleText () {
  const article = document.querySelector("article");
  if (article) return article.innerText;
  const paragraphs = Array.from(document.querySelectorAll("p"));
  if (paragraphs.length) return paragraphs.map(p => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_ARTICLE_TEXT") {
    const text = getArticleText();
    sendResponse({ text });
  } else if (request.type === "GET_URL") {
    const url = window.location.href;
    sendResponse({ url });
  }
})
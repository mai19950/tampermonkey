// ==UserScript==
// @name         javtrailers-data
// @namespace    mai19950@github.com
// @version      3.0
// @description  Javtrailers 数据提取、复制番号、保存 JSON
// @author       mai19950
// @match        https://javtrailers.com/*
// @grant        none
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-javtrailers.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-javtrailers.js
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    cardSelector: ".card-container",
    imageSelector: "img.video-image",
    titleSelector: "p.card-text.title",
    pageContainerSelector: "#__nuxt",
    prefix: "JT-"
  };
  let allData = [];

  const CSS = `
        /* Card Copy Button */
        .JT-copy-title {
            display: block;
            width: fit-content;
            box-sizing: border-box;
            margin: 5px auto;
            padding: 4px 12px;
            border-radius: 4px;
            background: #3e8ed0;
            color: #fff;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            user-select: none;
            transition: background-color .15s ease, transform .1s ease;
        }
        .JT-copy-title:hover {
            background: #3273a8;
        }
        .JT-copy-title:active {
            transform: scale(.97);
        }
        .JT-copy-title.JT-copied {
            background: #48c774;
        }

        /* Control Panel */
        #JT-panel {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            box-sizing: border-box;
            padding: 6px 10px;
            margin: 0 0 8px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            z-index: 1;
        }
        .JT-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            min-height: 34px;
            padding: 6px 14px;
            border: 1px solid transparent;
            border-radius: 5px;
            font-size: 14px;
            line-height: 1.4;
            font-family: inherit;
            cursor: pointer;
            user-select: none;
            transition: background-color .15s ease, border-color .15s ease;
        }
        .JT-button:hover {
            filter: brightness(.94);
        }
        .JT-button:active {
            transform: translateY(1px);
        }
        .JT-primary {
            background: #3273dc;
            border-color: #3273dc;
            color: #fff;
        }
        .JT-success {
            background: #48c774;
            border-color: #48c774;
            color: #fff;
        }

        /* Modal */
        #JT-modal {
            position: fixed;
            inset: 0;
            display: none;
            width: 100%;
            height: 100%;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        #JT-modal.JT-show {
            display: block;
        }
        .JT-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, .55);
        }
        .JT-modal-dialog {
            position: relative;
            width: calc(100% - 30px);
            max-width: 1200px;
            height: calc(100% - 60px);
            max-height: 900px;
            margin: 30px auto;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, .3);
        }
        .JT-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex: 0 0 auto;
            padding: 12px 16px;
            border-bottom: 1px solid #ddd;
            background: #f7f7f7;
        }
        .JT-modal-title {
            font-size: 17px;
            font-weight: 600;
            color: #333;
        }
        .JT-modal-close {
            border: 0;
            background: transparent;
            color: #666;
            font-size: 28px;
            line-height: 1;
            padding: 0 5px;
            cursor: pointer;
        }
        .JT-modal-close:hover {
            color: #000;
        }
        .JT-modal-body {
            flex: 1 1 auto;
            min-height: 0;
            overflow: auto;
            background: #fafafa;
        }
        .JT-code {
            box-sizing: border-box;
            min-height: 100%;
            margin: 0;
            padding: 16px;
            background: #fafafa;
            color: #333;
            font-family: Consolas, "Cascadia Code", "Courier New", monospace;
            font-size: 13px;
            line-height: 1.55;
            white-space: pre;
            tab-size: 2;
        }
        .JT-code code {
            font-family: inherit;
        }
        .JT-json-key {
            color: #922;
            font-weight: 600;
        }
        .JT-json-string {
            color: #080;
        }
        .JT-json-number {
            color: #164;
        }
        .JT-json-special {
            color: #a20;
        }
        .JT-modal-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex: 0 0 auto;
            padding: 10px 16px;
            border-top: 1px solid #ddd;
            background: #f7f7f7;
        }
        .JT-data-count {
            color: #777;
            font-size: 13px;
        }
        .JT-footer-close {
            padding: 6px 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #fff;
            font-size: 13px;
        }
        .JT-footer-close:hover {
            background: #eee;
        }

        /* Mobile */
        @media (max-width: 600px) {
            #JT-panel {
                padding: 5px;
            }
            .JT-button {
                flex: 1;
                padding-left: 8px;
                padding-right: 8px;
            }
            .JT-modal-dialog {
                width: calc(100% - 10px);
                height: calc(100% - 20px);
                margin: 10px auto;
                border-radius: 5px;
            }
            .JT-code {
                padding: 10px;
                font-size: 12px;
            }
        }
    `;

  function injectStyles () {
    if (document.getElementById("JT-style")) return;
    const style = document.createElement("style");
    style.id = "JT-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function createElement (tag, options = {}) {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.text !== undefined) element.textContent = options.text;
    if (options.html !== undefined) element.innerHTML = options.html;
    return element;
  }

  async function copyToClipboard (text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn("[Javtrailers] Clipboard API failed:", error);
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      textarea.remove();
      return success;
    } catch (error) {
      console.error("[Javtrailers] Copy failed:", error);
      return false;
    }
  }

  function getCardTitle (card) {
    const titleElement = card.querySelector(CONFIG.titleSelector);
    if (!titleElement) return "";
    return titleElement.textContent.trim().split(/\s+/)[0];
  }

  function enhanceCard (card) {
    if (!(card instanceof Element)) return;
    if (!card.matches(CONFIG.cardSelector)) return;
    if (card.dataset.jtEnhanced === "1") return;

    const title = getCardTitle(card);
    if (!title) return;

    card.dataset.jtEnhanced = "1";

    const button = createElement("div", {
      className: "JT-copy-title",
      text: title
    });

    button.title = "点击复制番号";

    button.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();

      const success = await copyToClipboard(title);

      if (success) {
        button.classList.add("JT-copied");
        setTimeout(() => {
          button.classList.remove("JT-copied");
        }, 1000);
      }
    });

    card.prepend(button);
  }

  function enhanceAllCards (root = document) {
    if (root instanceof Element && root.matches(CONFIG.cardSelector)) {
      enhanceCard(root);
    }

    if (!root.querySelectorAll) return;

    root.querySelectorAll(CONFIG.cardSelector).forEach(enhanceCard);
  }

  function startCardObserver () {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          if (node.matches(CONFIG.cardSelector)) {
            enhanceCard(node);
          }

          enhanceAllCards(node);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  function convertCoverUrl (url) {
    if (!url) return "";

    return url
      .replace("ps.w360.webp", "pl.w800.webp")
      .replace("ps.jpg", "pl.jpg")
      .replace("pf_o1_", "pb_e_");
  }

  function uniqueByTitle (data) {
    const map = new Map();

    for (const item of data) {
      if (item?.title) {
        map.set(item.title, item);
      }
    }

    return Array.from(map.values());
  }

  function getCurrentData () {
    const currentData = Array.from(
      document.querySelectorAll(CONFIG.imageSelector)
    )
      .map(image => {
        const title = (image.alt || "")
          .trim()
          .split(/\s+/)[0];

        const source =
          image.dataset.src ||
          image.getAttribute("data-src") ||
          image.src ||
          "";

        if (!title) return null;

        return {
          title,
          cover: convertCoverUrl(source)
        };
      })
      .filter(Boolean);

    allData = uniqueByTitle([
      ...allData,
      ...currentData
    ]);

    return allData;
  }

  function escapeHtml (text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlightJson (json) {
    let html = escapeHtml(json);

    html = html.replace(
      /(&quot;.*?&quot;)(?=\s*:)/g,
      '<span class="JT-json-key">$1</span>'
    );

    html = html.replace(
      /(&quot;.*?&quot;)/g,
      '<span class="JT-json-string">$1</span>'
    );

    html = html.replace(
      /\b(true|false|null)\b/g,
      '<span class="JT-json-special">$1</span>'
    );

    html = html.replace(
      /(?<![\w-])(-?\d+(?:\.\d+)?)(?![\w-])/g,
      '<span class="JT-json-number">$1</span>'
    );

    return html;
  }

  let modal;
  let codeElement;

  function createModal () {
    modal = createElement("div", {
      id: "JT-modal",
      className: "JT-modal"
    });

    modal.innerHTML = `
            <div class="JT-modal-backdrop"></div>
            <div class="JT-modal-dialog" role="dialog" aria-modal="true">
                <div class="JT-modal-header">
                    <div class="JT-modal-title">Javtrailers Data</div>
                    <button type="button" class="JT-modal-close" aria-label="Close">×</button>
                </div>
                <div class="JT-modal-body">
                    <pre class="JT-code"><code></code></pre>
                </div>
                <div class="JT-modal-footer">
                    <span class="JT-data-count"></span>
                    <button type="button" class="JT-modal-close JT-footer-close">Close</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    codeElement = modal.querySelector(".JT-code code");

    modal.querySelectorAll(".JT-modal-close").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        hideModal();
      });
    });

    modal.querySelector(".JT-modal-backdrop").addEventListener(
      "click",
      hideModal
    );

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("JT-show")) {
        hideModal();
      }
    });
  }

  function formatData (data) {
    return [
      "[",
      ...data.map((item, index) => {
        const title = JSON.stringify(item.title);
        const cover = JSON.stringify(item.cover);
        const comma = index < data.length - 1 ? "," : "";

        return `  {"title": ${title}, "cover": ${cover}}${comma}`;
      }),
      "]"
    ].join("\n");
  }

  function showModal (data) {
    if (!modal) createModal();

    codeElement.innerHTML = highlightJson(formatData(data));

    modal.querySelector(".JT-data-count").textContent =
      `${data.length} item${data.length === 1 ? "" : "s"}`;

    modal.classList.add("JT-show");
  }

  function hideModal () {
    if (!modal) return;
    modal.classList.remove("JT-show");
  }

  function saveJsonToFile (data, fileName = "data") {
    const blob = new Blob(
      [formatData(data)],
      { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function createControlPanel () {
    if (document.getElementById("JT-panel")) return;

    const panel = createElement("div", {
      id: "JT-panel"
    });

    const showButton = createElement("button", {
      className: "JT-button JT-primary",
      text: "Get Data"
    });

    const saveButton = createElement("button", {
      className: "JT-button JT-success",
      text: "Save To Json"
    });

    panel.append(showButton, saveButton);

    showButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      showModal(getCurrentData());
    });

    saveButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const data = getCurrentData();

      if (!data.length) {
        alert("No data found.");
        return;
      }

      const fileName = prompt("Please input file name:", "data");

      if (fileName === null) return;

      saveJsonToFile(
        data,
        fileName.trim() || "data"
      );
    });

    const target = document.querySelector(
      CONFIG.pageContainerSelector
    );

    if (target?.parentNode) {
      target.parentNode.insertBefore(panel, target);
    } else {
      document.body.prepend(panel);
    }
  }

  function init () {
    if (window.__JAVTRAILERS_DATA_V3__) return;

    window.__JAVTRAILERS_DATA_V3__ = true;

    injectStyles();
    enhanceAllCards();
    createControlPanel();
    startCardObserver();

    console.log("[Javtrailers Data] initialized");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
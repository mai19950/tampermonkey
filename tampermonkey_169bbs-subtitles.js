// ==UserScript==
// @name         169bbs-subtitles
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  删除非 R9*** 作者的帖子（支持动态加载）
// @author       mai19900
// @match        https://169bbs.com/forum.php**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=169bbs.com
// @grant        none
// @downloadURL https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_169bbs-subtitles.js
// @updateURL   https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_169bbs-subtitles.js
// ==/UserScript==

(function () {
  "use strict";

  const KEYWORD = "R9***";

  function filterThreads() {
    document.querySelectorAll(".list_author").forEach(el => {
      if (!el.textContent.includes(KEYWORD)) {
        const tbody = el.closest('tbody[id^="normalthread_"]');
        if (tbody) tbody.remove();
      }
    });
  }

  // 1️⃣ 页面初次加载完成执行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", filterThreads);
  } else {
    filterThreads();
  }

  // 2️⃣ 监听页面 DOM 变化（加载更多 / AJAX）
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        filterThreads();
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();

// ==UserScript==
// @name         SUPJAV Title
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动设置标题（RM/非RM），并监听 ss 快捷键进行站内搜索
// @author       mai19900
// @match        https://supjav.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=supjav.com
// @grant        none
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_supjav-title.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_supjav-title.js
// ==/UserScript==

(function () {
  "use strict";

  /* ========= 标题处理 ========= */

  function extractCode(title) {
    return title
      .replace(/\[.*?\]/g, "")
      .split(" ")
      .find(x => /^[0-9a-z]+-[0-9a-z]+$/i.test(x));
  }

  function updateTitle() {
    const originalTitle = document.title;
    const code = extractCode(originalTitle);

    if (!code) return;

    const isRM = originalTitle.includes("无码破解");

    document.title = isRM ? `${code}-RM` : code;
  }

  updateTitle();

  /* ========= ss 快捷键搜索 ========= */

  let lastKey = "";
  let lastTime = 0;
  const INTERVAL = 500; // ms，允许的最大间隔

  document.addEventListener("keydown", function (e) {
    const now = Date.now();

    if (e.key.toLowerCase() === "s") {
      if (lastKey === "s" && now - lastTime < INTERVAL) {
        const title = prompt("input title:");
        if (title) {
          const url = `${location.origin}/zh/?s=${encodeURIComponent(title)}`;
          window.location.replace(url);
        }
        lastKey = "";
        lastTime = 0;
        return;
      }

      lastKey = "s";
      lastTime = now;
    } else {
      lastKey = "";
      lastTime = 0;
    }
  });
})();

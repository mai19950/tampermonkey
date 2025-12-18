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

  /* ========= 快捷键监听（ss / cc） ========= */

  let lastKey = "";
  let lastTime = 0;
  const INTERVAL = 500;

  document.addEventListener("keydown", function (e) {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    const key = e.key.toLowerCase();
    const now = Date.now();

    if (key === "s") {
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
    }

    if (key === "c") {
      if (lastKey === "c" && now - lastTime < INTERVAL) {
        copyTitle();
        lastKey = "";
        lastTime = 0;
        return;
      }
    }

    lastKey = key;
    lastTime = now;
  });

  /* ========= 复制 title ========= */

  function copyTitle() {
    const text = document.title;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast(`Copied: ${text}`);
        })
        .catch(() => {
          legacyCopy(text);
        });
    } else {
      legacyCopy(text);
    }
  }

  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    toast(`Copied: ${text}`);
  }

  /* ========= 简易提示 ========= */

  function toast(msg) {
    console.log(msg);
  }
})();

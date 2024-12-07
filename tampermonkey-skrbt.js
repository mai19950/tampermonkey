// ==UserScript==
// @name         Copy-Skrbt
// @namespace    http://tampermonkey.net/
// @version      2024-12-07
// @description  自动复制磁力链接
// @author       mai19950
// @match        https://skrbtzz.top/detail/*
// @match        https://skrbtmu.top/detail/*
// @match        https://skrbtyx.top/detail/*
// @match        https://skrbtgb.top/detail/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skrbtzz.top
// @grant        none
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-skrbt.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-skrbt.js
// ==/UserScript==

(function() {
  'use strict';

  function copySkrBt() {
    const title = document.querySelector("h3").innerText.trim();
    const href = document
      .querySelector(".list-unstyled li:nth-child(4)")
      .innerText.replace(/.*?([0-9A-Za-z]).*?/, "$1");
    const size = document
      .querySelector(".panel-body .list-unstyled li:nth-of-type(2)")
      .textContent.trim()
      .replace("文件大小：", "");
    const t = `[${title}(${size})](magnet:?xt=urn:btih:${href})`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(
        () => {
          console.log("复制成功！");
          alert(t);
        },
        (err) => {
          console.error("复制失败：", err);
        }
      )
    } else {
      const inputEl = document.createElement('input')
      inputEl.setAttribute("value", t)
      document.body.appendChild(inputEl)
      inputEl.select()
      if (document.execCommand("copy")) {
        alert(t)
      } else {
        console.error("复制失败")
      }
    }
    return t;
  }
  copySkrBt();
})();

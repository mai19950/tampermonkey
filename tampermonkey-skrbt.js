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
    // var o = document.querySelector(`#archiveResult > tbody > tr:nth-child(${num}) a[rel="information"]`)
    var title = document.querySelector("h3").innerText.trim();
    var href = document
      .querySelector(".list-unstyled li:nth-child(4)")
      .innerText.replace(/.*?([0-9A-Za-z]).*?/, "$1");
    var size = document
      .querySelector(".panel-body .list-unstyled li:nth-of-type(2)")
      .textContent.trim()
      .replace("文件大小：", "");
    var t = `[${title}(${size})](magnet:?xt=urn:btih:${href})`;
    var input = document.createElement("input");
    input.setAttribute("value", t);
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return t;
  }
  alert(copySkrBt());
})();
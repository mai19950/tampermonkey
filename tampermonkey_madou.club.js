// ==UserScript==
// @name         MADOU.CLUB
// @namespace    http://tampermonkey.net/
// @version      2025-06-08
// @description  try to take over the world!
// @author       You
// @match        https://madou.club/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=madou.club
// @grant        none
// @downloadURL https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_madou.club.js
// @updateURL   https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_madou.club.js
// ==/UserScript==

(function () {
  "use strict";
  $(".app-desktop-banner").remove();
  $("head").append(`
      <style>
      .box.copy-title {
          background-color: #3e8ed0; /* 背景色 */
          text-align: center; /* 文本水平居中 */
          padding: 3px; /* 内边距 */
          margin: 5px auto; /* 左右居中 */
          color: #fff;
          font-wight: 1000;
          cursor: pointer;
      }
  </style>
  `);
  // 已处理过的元素添加一个标记类，避免重复插入
  function enhanceExcerpt($el) {
    if ($el.hasClass("copy-title-inserted")) return;
    $el.addClass("copy-title-inserted");

    var text = $el.find("h2 > a").text().trim().split(" ")[0];
    const $box = $('<div class="box copy-title">' + text + "</div>");
    $el.prepend($box);
    $box.click(function () {
      copyToClipboard(text);
      $box.css("background-color", "#8BC34A");
      setTimeout(() => $box.css("background-color", "#3e8ed0"), 1000);
    });
  }

  function enhanceAll() {
    $("article.excerpt.excerpt-c5").each(function () {
      enhanceExcerpt($(this));
    });
  }

  // 初始处理一次
  $(document).ready(function () {
    enhanceAll();
  });

  // 使用 MutationObserver 监听新内容添加
  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      $(mutation.addedNodes).each(function () {
        const $node = $(this);
        if ($node.is("article.excerpt.excerpt-c5")) {
          enhanceExcerpt($node);
        } else {
          // 也许子节点中有 article.excerpt.excerpt-c5
          $node.find("article.excerpt.excerpt-c5").each(function () {
            enhanceExcerpt($(this));
          });
        }
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    // alert('文本已复制到剪贴板：' + text);
  }
})();

// ==UserScript==
// @name         ADD-Title-For-javdb
// @namespace    http://tampermonkey.net/
// @version      2026-02-13
// @description  try to take over the world!
// @author       You
// @match        https://javdb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javdb.com
// @grant        none
// @downloadURL https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_ADD-Title-For-javdb.js
// @updateURL   https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_ADD-Title-For-javdb.js
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

      a.box {
        margin-bottom: 0 !important;
      }
      .box.delete-item {
          background-color: #e53935;
          text-align: center;
          padding: 3px;
          color: #fff;
          font-weight: 1000;
          cursor: pointer;
      }
      #fixed-copy-all {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9999;
        background: #673ab7;
        color: #fff;
        padding: 10px 14px;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-weight: bold;
        user-select: none;
      }
  </style>
  `);

  // ===== 固定复制全部按钮 =====
  const $fixedCopyBtn = $('<div id="fixed-copy-all">复制全部</div>');
  $("body").append($fixedCopyBtn);

  $fixedCopyBtn.click(function () {
    const text = `'${$(".copy-title")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ")}'`;

    copyToClipboard(text);

    // 成功提示
    $fixedCopyBtn.css("background", "#4caf50");
    setTimeout(() => {
      $fixedCopyBtn.css("background", "#673ab7");
    }, 1000);
  });

  $(document).ready(function () {
    // 遍历每个 .item 元素
    $(".item").each(function () {
      var $item = $(this);
      // 获取 .item 元素内 strong 标签的文本内容
      var text = $item.find("strong").text().trim();
      // 创建一个新的 .box 元素，并添加额外的类名
      const $copyBox = $('<div class="box copy-title">' + text + "</div>");
      // 将 .box 元素插入到 .item 元素的最前面
      $item.prepend($copyBox);
      // 添加点击事件处理程序
      $copyBox.click(function () {
        // 复制 .box 元素内的文本内容到剪贴板
        copyToClipboard(text);
        // 临时修改 .box 元素的背景色为绿色
        $copyBox.css("background-color", "#8BC34A"); // 修改为绿色

        // 恢复 .box 元素的背景色为原始色（这里使用 setTimeout 模拟短暂的颜色变化）
        setTimeout(function () {
          $copyBox.css("background-color", "#3e8ed0"); // 恢复为原始背景色
        }, 1000); // 1秒后恢复为原始背景色
      });
      const $deleteBox = $('<div class="box delete-item">删除</div>');
      $item.append($deleteBox);
      $deleteBox.click(function () {
        $item.remove();
      });
    });
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

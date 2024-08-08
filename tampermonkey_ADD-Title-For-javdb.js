// ==UserScript==
// @name         ADD-Title-For-javdb
// @namespace    http://tampermonkey.net/
// @version      2024-06-15
// @description  try to take over the world!
// @author       You
// @match        https://javdb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javdb.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
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
  `)
$(document).ready(function() {
  // 遍历每个 .item 元素
  $('.item').each(function() {
      // 获取 .item 元素内 strong 标签的文本内容
      var text = $(this).find('strong').text().trim();
      // 创建一个新的 .box 元素，并添加额外的类名
      const $box = $('<div class="box copy-title">'+text+'</div>');
      // 将 .box 元素插入到 .item 元素的最前面
      $(this).prepend($box);
      // 添加点击事件处理程序
      $box.click(function() {
          // 复制 .box 元素内的文本内容到剪贴板
          copyToClipboard(text);
          // 临时修改 .box 元素的背景色为绿色
          $box.css('background-color', '#8BC34A'); // 修改为绿色

          // 恢复 .box 元素的背景色为原始色（这里使用 setTimeout 模拟短暂的颜色变化）
          setTimeout(function() {
              $box.css('background-color', '#3e8ed0'); // 恢复为原始背景色
          }, 1000); // 1秒后恢复为原始背景色
      });
  });
});
  function copyToClipboard(text) {
      var $temp = $('<input>');
      $('body').append($temp);
      $temp.val(text).select();
      document.execCommand('copy');
      $temp.remove();
      // alert('文本已复制到剪贴板：' + text);
  }
})();
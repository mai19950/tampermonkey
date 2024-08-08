// ==UserScript==
// @name         迅雷云盘自动刷新
// @namespace    http://tampermonkey.net/
// @version      2024-05-25
// @description  try to take over the world!
// @author       git@github.com:mai19950
// @match        https://pan.xunlei.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xunlei.com
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  $("head").append(`
    <style>
  /* 自定义样式 */
  #fixed-tag {
    position: fixed;
    top: 50%;
    left: 20px;
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    margin-top: -1.166em;
    border-radius: 5px;
    cursor: pointer;
    z-index: 999;
  }
</style>

  `)

  $("body").append(`
       <div id="fixed-tag">${new Date().toLocaleTimeString()}</div>
  `)

  // 设置刷新间隔时间（单位：毫秒）
  const refreshInterval = 1800000; // 300000毫秒 = 5分钟

  // 设置定时器，每隔一段时间执行刷新函数
  // setInterval(refreshPage, refreshInterval);
  setTimeout(() => {
      location.reload();
  }, refreshInterval)
})();
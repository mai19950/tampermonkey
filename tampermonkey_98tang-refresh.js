// ==UserScript==
// @name         98tang刷新
// @namespace    http://tampermonkey.net/
// @version      2024-06-18
// @description  try to take over the world!
// @author       mai19900
// @match        https://www.sehuatang.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sehuatang.org
// @grant        none
// @downloadURL https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_98tang-refresh.js
// @updateURL   https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_98tang-refresh.js
// ==/UserScript==

(function() {
  'use strict';
   // 创建计时器容器
  const timerContainer = document.createElement('div');
  timerContainer.id = 'page-timer-container';

  // 初始化时间
  const step = 5;
  let secondsElapsed = -step;

  // 更新计时器显示
  function updateTimer() {
      secondsElapsed += step;
      const hours = Math.floor(secondsElapsed / 3600);
      const minutes = Math.floor((secondsElapsed % 3600) / 60);
      const seconds = secondsElapsed % 60;
      timerContainer.textContent = `Time on page: ${hours}h ${minutes}m ${seconds}s`;
      // 检查时间是否超过30秒，超过则将标签背景颜色改为绿色
      if (secondsElapsed >= 30) {
          timerContainer.style.backgroundColor = 'green';
      }
  }

  // 立即执行一次更新计时器函数
  updateTimer();

  // 每秒更新一次计时器
  setInterval(updateTimer, step * 1000);

  // 将计时器添加到页面
  document.body.appendChild(timerContainer);

  // 创建并添加样式标签
  const style = document.createElement('style');
  style.textContent = `
      #page-timer-container {
          position: fixed;
          top: 100px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          z-index: 10000;
          font-family: Arial, sans-serif;
          font-size: 14px;
      }
  `;
  document.head.appendChild(style);
  // 设置刷新间隔时间（单位：毫秒）
  const refreshInterval = 120000; // 300000毫秒 = 5分钟

  // 设置定时器，每隔一段时间执行刷新函数
  // setInterval(refreshPage, refreshInterval);
  setTimeout(() => {
      // location.reload();
  }, refreshInterval)
})();
// ==UserScript==
// @name         Get-SGPTV
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       mai19950
// @match        https://web.telegram.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=telegram.org
// @grant        GM_addStyle
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-Tg.sgptv.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey-Tg.sgptv.js
// ==/UserScript==

(function () {
  "use strict";

  // 使用 GM_addStyle 添加共享的 CSS 样式
  // 这些样式适用于所有具有 'tampermonkey-fixed-button' 类的按钮
  GM_addStyle(`
  .tampermonkey-fixed-button {
      right: 30px;         /* 距离右侧30px */
      top: 100px;
      position: fixed;       /* 固定定位 */
      z-index: 1000;         /* 确保按钮在其他内容之上 */
      color: white;          /* 白色文字 */
      padding: 10px 15px;    /* 内边距 */
      border: none;          /* 无边框 */
      border-radius: 5px;    /* 圆角 */
      cursor: pointer;       /* 鼠标悬停时显示手型 */
      font-size: 16px;       /* 字体大小 */
      box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* 添加阴影效果 */
      opacity: 0.9;          /* 默认透明度 */
      transition: opacity 0.3s ease; /* 添加透明度过渡效果 */
  }

  /* 鼠标悬停效果 */
  .tampermonkey-fixed-button:hover {
      opacity: 1;
  }

  #myModalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: none;
    z-index: 9999;
}
    #myModal {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 90vw;
    min-width: 70vw;
    max-height: 90vh;
}
/* ===== 极简 pre 标签样式 ===== */
#myModal pre {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  border-left: 4px solid #2c3e50;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: auto;        
  max-height: 90%; 
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  color: #2c3e50;
  line-height: 1.5;
  border-radius: 4px;
  /* 强制文本选择 */
  user-select: text;      /* 强制整个pre区域可选择 */
  -webkit-user-select: text; /* Safari 兼容 */
  -moz-user-select: text;    /* Firefox 兼容 */
}
`);
  const elements = [];
  const overlay = document.createElement("div");
  elements.push(overlay);
  overlay.id = "myModalOverlay";

  const modal = document.createElement("div");
  modal.id = "myModal";
  overlay.appendChild(modal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.style.display = "none"; // 隐藏模态窗口
    }
  });

  function showModal(data) {
    const code = data.map(e => JSON.stringify(e)).join(",\n  ");
    console.info(code);
    modal.innerHTML = `<pre>\n\n\n${"  " + code}\n\n\n</pre>`; // 设置模态窗口的内容
    overlay.style.display = "block"; // 显示模态窗口
  }
  // 创建按钮元素
  const oBtn01 = document.createElement("button");
  oBtn01.textContent = "SGPTV002"; // 按钮显示的文字
  oBtn01.id = "sgptv002"; // 给按钮一个ID方便引用和样式控制
  oBtn01.classList.add("tampermonkey-fixed-button");

  // 添加 unique 样式 (位置和颜色)
  oBtn01.style.backgroundColor = "#0984e3"; // 蓝色背景
  elements.push(oBtn01);

  // 添加点击事件监听器
  oBtn01.addEventListener("click", function () {
    console.log("数据提取按钮被点击，开始执行代码...");

    // --- 用户提供的 JavaScript 代码开始 ---
    // 这段代码将查找消息容器和消息元素，提取相关信息，并存储到 window.d 变量中
    const d = Array.from(
      document.querySelector(".messages-container")?.querySelectorAll("[id^='message-']") || []
    )
      .map(e => {
        const desc = Array.from(e.querySelector(".text-content")?.childNodes || [])
          .filter(nd => nd.nodeType === Node.TEXT_NODE || nd?.tagName === "CODE")
          .reduce((ac, nd) => (ac += nd.textContent.trim()), "");
        return {
          id: Number(e.id.replace("message-", "")),
          order:
            desc
              .match(/((π[\d]+)|([\d]+[a-z]))/gi)
              ?.at(0)
              ?.trim() || "none",
          tags: [...e.querySelectorAll('a[data-entity-type="MessageEntityHashtag"]')]
            .map(a => a.textContent)
            .filter(n => !n.includes("#水果派")),
          duration: e.querySelector(".message-media-duration")?.textContent,
          desc,
          code: e.querySelector("code.text-entity-code")?.textContent?.trim() || "none",
        };
      })
      .filter(it => it.order && !it.order.startsWith("none"))
      .reduce((arr, it) => (arr.some(i => i.id === it.id) ? arr : [...arr, it]), window.d || []);
    showModal(d);
  });

  const oBtn02 = document.createElement("button");
  oBtn02.textContent = "SGPTV003"; // 按钮显示的文字
  oBtn02.id = "sgptv003"; // 给按钮一个ID方便引用和样式控制
  oBtn02.classList.add("tampermonkey-fixed-button");

  // 添加 unique 样式 (位置和颜色)
  oBtn02.style.top = "150px"; // 距离底部30px
  oBtn02.style.backgroundColor = "#00b894"; // 蓝色背景
  elements.push(oBtn02);

  oBtn02.addEventListener("click", function () {
    console.log("数据提取按钮被点击，开始执行代码...");
    const d = Array.from(
      document.querySelector(".messages-container").querySelectorAll("[id^='message-']")
    )
      .map(e => {
        const textMsg = e.querySelector(".text-content");
        if (!textMsg) return {};
        textMsg.querySelector(".Reactions")?.remove();
        textMsg.querySelector(".MessageMeta")?.remove();
        const htmlStr = textMsg.textContent.replaceAll(/\s+/g, " ");
        const matchRes = htmlStr.match(
          /^(?<order>[\da-z]+)(?<desc>.+?)(?:番号：(?<code>.+?))?女优：(?<actor>(#.+?)+)(标签|出处)：(?<tags>(#.+?)+)$/i
        );
        const groups = matchRes?.groups || {};
        return {
          id: Number(e.id.replace("message-", "")),
          order: groups.order || "",
          code: groups.code?.trim().replace(" ", "") || "none",
          desc: groups.desc?.trim() || "",
          actor: groups.actor
            ?.split("#")
            .filter(Boolean)
            .map(item => item.trim())
            .join("."),
          tags: groups.tags?.split(" "),
        };
      })
      .filter(it => it && it.order && it.order != "")
      .reduce((arr, it) => (arr.some(i => i.id === it.id) ? arr : [...arr, it]), []);
    showModal(d);
  });

  // 将按钮添加到页面 body
  // 确保 body 元素存在后再添加按钮
  function appendButtons() {
    if (document.body) {
      elements.forEach(btn => document.body.appendChild(btn));
    } else {
      // 如果body还没准备好，等待 DOMContentLoaded 事件或下一帧
      requestAnimationFrame(appendButtons);
    }
  }

  appendButtons();
})();

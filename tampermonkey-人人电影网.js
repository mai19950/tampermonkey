// ==UserScript==
// @name         人人电影网-生成链接
// @namespace    mai19950@github.com
// @version      1.0
// @description  提取人人电影网的网盘链接
// @author       mai19950
// @match        https://www.rrdynb.com/*/*
// @match        https://www.rrdyw.top/*/*
// @match        https://www.rr2022.com/*/*
// @icon         https://www.rrdynb.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  if (/^\/(dongman|movie|dianshiju|zongyi)\/$/.test(location.pathname)) {
    return;
  }

  // 定义点击按钮
  var oBtn = document.createElement("button");
  oBtn.textContent = "点击复制文本";
  oBtn.title = "点击复制文本";
  oBtn.style.margin = "3px";
  oBtn.style.display = "block";
  oBtn.style.position = "relative";
  oBtn.style.zIndex = 101;

  // 定义内容文本框
  var oTextarea = document.createElement("textarea");
  oTextarea.style.backgroundColor = "#c7edcc";
  oTextarea.style.height = "300px";
  oTextarea.style.width = "100%";
  oTextarea.style.zIndex = 100;
  oTextarea.style.display = "block";
  oTextarea.style.position = "relative";
  // 设置文本框内容
  oTextarea.innerHTML =
    document.querySelector("h1").textContent.trim() +
    "\n\n" +
    parseHtml(
      Array.from(document.querySelectorAll(".movie-txt > :last-of-type")).reduce(
        (s, el) => [...s, ...el.children],
        []
      )
    );

  // 给点击按钮添加监听事件
  oBtn.addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(oTextarea.value);
        alert("文本已复制到剪贴板！");
      } catch (err) {
        console.log("复制失败：", err);
      }
    },
    false
  );

  // 把 `html`元素添加到页面
  document.querySelector(".movie-txt").appendChild(oTextarea);
  oTextarea.parentNode.insertBefore(oBtn, oTextarea);

  function parseHtml(elements) {
    /**
     * 该函数用于解析页面中的网盘内容
     *
     * @var {[elements]}  // html元素迭代器
     */
    let htmlText = "";
    for (const el of elements) {
      if ((el.tagName === "SPAN" || el.tagName === "DIV") && el.innerHTML.includes("href=")) {
        htmlText += parseHtml(el.children);
      } else {
        switch (el.tagName) {
          case "BR":
            htmlText.endsWith("\n") || (htmlText += "\n");
            break;
          case "A":
            htmlText += `${el.href} `;
            htmlText = htmlText.replace(/(资源)(?![\s\S]*资源)/, `$1(${el.textContent.trim()})`);
            break;
          default:
            var text = el.textContent.trim();
            htmlText += chineseLength(text) > 10 ? "" : text;
            break;
        }
      }
    }
    return htmlText;
  }

  function chineseLength(str) {
    // 使用正则表达式匹配中文字符
    var chineseCharacters = str.match(/[\u4e00-\u9fa5]/g);
    // 中文字符的长度为字符数组的长度
    return chineseCharacters ? chineseCharacters.length : 0;
  }
})();

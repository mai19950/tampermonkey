// ==UserScript==
// @name         twsafe.space-提取链接
// @namespace    http://tampermonkey.net/
// @version      2024-09-08
// @description  try to take over the world!
// @author       You
// @match        https://www.twsafe.space/*
// @match        https://www.786551.xyz/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twsafe.space
// @grant        none
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/twsafe.space.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/twsafe.space.js
// ==/UserScript==

(function () {
  "use strict";

  // 查找所有的 <a> 标签
  var links = document.querySelectorAll('a[rel="nofollow"]');
  console.log(links);

  // 遍历每个 <a> 标签
  links.forEach(function (link) {
    // 获取 <a> 标签的 href 属性
    var href = link.getAttribute("href");

    // 如果 href 存在
    if (href) {
      var input = document.createElement("input");
      input.type = "text";
      input.value = href;
      input.readOnly = true; // 只读
      input.style.marginLeft = "5px";
      input.style.color = "red"; // 自定义样式

      // 根据链接内容长度调整宽度
      input.size = href.length + 5; // 设置 input 的 size 属性，以适应链接长度

      // 将 <input> 插入到 <a> 标签后面
      link.parentNode.insertBefore(input, link.nextSibling);

      // 创建一个复制按钮
      var button = document.createElement("button");
      button.textContent = "复制";
      button.style.marginLeft = "5px";

      // 添加按钮点击事件
      button.addEventListener("click", function () {
        input.select();
        document.execCommand("copy");
        // alert("链接已复制: " + input.value);
      });

      // 将复制按钮插入到 <input> 后面
      link.parentNode.insertBefore(button, input.nextSibling);

      // 创建并插入一个 <br> 标签
      var br = document.createElement("br");
      link.parentNode.insertBefore(br, button.nextSibling);
    }
  });


  // 新功能: 查找所有 <h3 class="title"><a> 标签
  var h3Links = document.querySelectorAll("h3.title > a");
  console.log(h3Links);

  // 遍历每个 <h3><a> 标签
  h3Links.forEach(function (link) {
    // 获取 <a> 标签的文本内容
    var text = link.textContent.trim();

    // 创建 <input> 元素
    var input = document.createElement("input");
    input.type = "text";
    input.value = text; // 设置为 <a> 标签的文本内容
    input.readOnly = true; // 只读
    input.style.marginLeft = "5px";

    // 根据文本内容长度调整宽度
    input.size = text.length + 5; // 设置 input 的 size 属性，以适应文本长度

    // 将 <input> 插入到 <a> 标签后面
    link.parentNode.insertBefore(input, link.nextSibling);

    // 创建一个复制按钮
    var button = document.createElement("button");
    button.textContent = "复制";
    button.style.marginLeft = "5px";

    // 添加按钮点击事件
    button.addEventListener("click", function () {
      input.select();
      document.execCommand("copy");
    });

    // 将复制按钮插入到 <input> 后面
    link.parentNode.insertBefore(button, input.nextSibling);
  });
})();

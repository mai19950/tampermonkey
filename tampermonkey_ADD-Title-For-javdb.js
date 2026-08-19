// ==UserScript==
// @name         ADD-Title-For-javdb
// @namespace    http://tampermonkey.net/
// @version      2026-08-07
// @description  Javdb handler !
// @author       mai19950
// @include      /^https:\/\/javdb\.com\/.*/
// @include      /^https:\/\/javdb\d+\.com\/.*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javdb.com
// @grant        none
// @downloadURL https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_ADD-Title-For-javdb.js
// @updateURL   https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_ADD-Title-For-javdb.js
// ==/UserScript==

(function () {
  "use strict";
  $(".app-desktop-banner").remove();
  $("head").append(
    `<style>
  .item-action-box {
    display: flex;
    gap: 0;
    margin: 5px 0;
    width: 100%;
    max-width: 160px;
  }

  .item-action-box .box {
    flex: 1;
    height: 28px;
    line-height: 28px;
    margin: 0 !important;
    padding: 0 !important;
    text-align: center;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
  }

  .item-action-box .copy-title {
    background-color: #3e8ed0;
  }

  .item-action-box .delete-item {
    background-color: #e53935;
  }

  .item-action-box .copy-json {
    background-color: #ff9800;
  }

  .item-action-box .box:hover {
    opacity: 0.85;
  }

  a.box {
    margin-bottom: 0 !important;
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

  #fixed-export-csv {
    position: fixed;
    right: 20px;
    bottom: 70px;
    z-index: 9999;
    background: #009688;
    color: #fff;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    font-weight: bold;
    user-select: none;
  }

  #fixed-copy-json {
    position: fixed;
    right: 20px;
    bottom: 120px;
    z-index: 9999;
    background: #ff5722;
    color: #fff;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    font-weight: bold;
    user-select: none;
  }
  </style>`
  );
  // ===== 固定复制全部按钮 =====
  const $fixedCopyBtn = $('<div id="fixed-copy-all">复制全部</div>');
  $("body").append($fixedCopyBtn);

  // ===== 固定导出CSV按钮 =====
  const $exportCsvBtn = $('<div id="fixed-export-csv">导出CSV</div>');
  $("body").append($exportCsvBtn);

  const $copyJsonBtn = $('<div id="fixed-copy-json">All Data</div>');
  $("body").append($copyJsonBtn);

  $fixedCopyBtn.click(function () {
    const text = `'${$(".copy-title")
      .map((_, el) => $(el).attr("title") || "")
      .get()
      .join(" ")}'`;

    copyToClipboard(text);

    // 成功提示
    $fixedCopyBtn.css("background", "#4caf50");
    setTimeout(() => {
      $fixedCopyBtn.css("background", "#673ab7");
    }, 1000);
  });

  function addItemButtons ($item) {
    if ($item.find(".item-action-box").length) {
      return;
    }
    let text = $item.find("strong").text().trim();
    const $copyBox = $(`<div class="box copy-title" title="${text}">Title</div>`);
    const $actionBox = $('<div class="item-action-box"></div>');
    $copyBox.click(function () {
      copyToClipboard(text);
      $copyBox.css("background-color", "#8BC34A");
      setTimeout(function () {
        $copyBox.css("background-color", "#3e8ed0");
      }, 1000);
    });
    const $deleteBox = $('<div class="box delete-item">Del</div>');
    $deleteBox.click(function () {
      $item.remove();
    });
    const $jsonBox = $('<div class="box copy-json">JSON</div>');
    $jsonBox.click(function () {
      let img = $item.find('img[loading="lazy"]').attr('src') || "";
      let href = $item.find('a.box').attr('href') || "";
      let data = {
        link: location.origin + href,
        hash: href.split('/').pop(),
        desc: $item.find('a.box').attr('title') || "",
        cover: img.replace('thumbs', 'covers'),
        thumb: img.replace('covers', 'thumbs'),
        title: $item.find('.video-title > strong').text().trim(),
        date: $item.find('.meta').text().trim()
      };
      copyToClipboard(JSON.stringify(data));
      $jsonBox.css("background-color", "#4caf50");
      setTimeout(() => {
        $jsonBox.css("background-color", "#ff9800");
      }, 1000);
      console.log(data);
    });
    $actionBox.append($copyBox);
    $actionBox.append($deleteBox);
    $actionBox.append($jsonBox);
    $item.prepend($actionBox);
  }
  // 初始化已有item
  $(".item").each(function () {
    addItemButtons($(this));
  });
  // 监听动态新增item
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) {
          return;
        }
        let $node = $(node);
        if ($node.hasClass("item")) {
          addItemButtons($node);
        }
        $node.find(".item").each(function () {
          addItemButtons($(this));
        });
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  function copyToClipboard (text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    // alert('文本已复制到剪贴板：' + text);
  }

  $exportCsvBtn.click(function () {
    let data = Array.from($('.item').get(), item => [
      $(item).find('.video-title > strong').text().trim(),
      $(item).find('.meta').text().trim()
    ]);
    // 根据总数计算序号位数
    let digits = String(data.length).length;
    // 加入序号，并转换日期
    data = data.map((item, index) => {
      let no = String(index + 1).padStart(digits, '0');
      let date = item[1]
        .replace(/-/g, '')
        .slice(2);
      return [
        no,
        item[0],
        date
      ];
    });
    // console.log(data);
    // CSV转义
    function escapeCSV (value) {
      value = String(value);
      if (/[,"\n]/.test(value)) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    }
    let csv = data
      .map(row => row.map(escapeCSV).join(','))
      .join('\n');
    let blob = new Blob(
      [csv],
      { type: 'text/csv;charset=utf-8' }
    );
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'rank.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 成功提示
    $exportCsvBtn.css("background", "#4caf50");
    setTimeout(() => {
      $exportCsvBtn.css("background", "#009688");
    }, 1000);
  });

  $copyJsonBtn.click(function () {
    let data = Array.from($('.item')).map(item => {
      let $item = $(item);
      let img = $item.find('img[loading="lazy"]').attr('src') || "";
      let href = $item.find('a.box').attr('href') || "";
      return {
        link: location.origin + href,
        hash: href.split('/').pop(),
        desc: $item.find('a.box').attr('title') || "",
        cover: img.replace('thumbs', 'covers'),
        thumb: img.replace('covers', 'thumbs'),
        title: $item.find('.video-title > strong').text().trim(),
        date: $item.find('.meta').text().trim()
      };
    });
    let text = JSON.stringify(data);
    copyToClipboard(text);
    console.log(data);
    $copyJsonBtn.css("background", "#4caf50");
    setTimeout(() => {
      $copyJsonBtn.css("background", "#ff5722");
    }, 1000);
  });
})();

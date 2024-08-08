// ==UserScript==
// @name         javtrailers-data
// @namespace    mai19950@github.com
// @version      1.0
// @description  显示网页内容
// @author       mai19950
// @match        https://javtrailers.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  $("head").append(
    `<link href="https://cdn.bootcdn.net/ajax/libs/highlight.js/10.7.3/styles/default.min.css" rel="stylesheet">`
  );
  $("head").append(
    `<script src="https://cdn.bootcdn.net/ajax/libs/highlight.js/10.7.3/highlight.min.js"></script>`
  );
  $("head").append(
    `<link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.1/css/bootstrap.min.css" rel="stylesheet">`
  );
  $("head").append(
    `<script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.1/js/bootstrap.bundle.min.js"></script>`
  );
  $("head").append(
    `<style>
      pre {
        counter-reset: line;
      }
      pre line {
          counter-increment: line;
      }
      pre line::before {
          content: counter(line);
          display: inline-block;
          width: 2em;
          text-align: right;
          margin-right: 1em;
          color: gray;
      }
      #show-data {
        display: flex;
        flex-direction: column;
        width: 100%;
        /* min-height: 200px; */
      }

      .action-btn {
        display: inline-block;
        margin: 3px;
        border-radius: 3px;
        flex-grow: 0;
        width: auto;
      }
      #__code {
        display: block;
        margin: 10px;        
      }
      #__code code {
        padding: 10px;
      }
    </style>`
  );

  const oShowData = document.createElement("div");
  oShowData.id = "show-data";
  oShowData.innerHTML = `
  <div class="modal fade" id="__modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-body">
          <pre id="__code"></pre>
        </div>
      </div>
    </div>
  </div>
  `;

  const oBtnGroup = document.createElement("div");
  oBtnGroup.id = "__btn-group";
  oShowData.appendChild(oBtnGroup);

  const oShowBtn = genBtn("__show", "Get Data");
  oShowBtn.classList.add("btn", "btn-primary");
  oShowBtn.setAttribute("data-bs-toggle", "modal");
  oShowBtn.setAttribute("data-bs-target", "#__modal");
  oBtnGroup.appendChild(oShowBtn);
  // const oHideBtn = genBtn("__hide", "Hide Data");
  // oHideBtn.classList.add("btn", "btn-secondary");
  // oBtnGroup.appendChild(oHideBtn);
  const oSaveBtn = genBtn("__save", "Save To Json");
  oSaveBtn.classList.add("btn", "btn-success");
  oBtnGroup.appendChild(oSaveBtn);

  const targetEle = document.getElementById("__nuxt");
  targetEle.parentNode.insertBefore(oShowData, targetEle);

  oShowBtn.addEventListener(
    "click",
    () => {
      const html = getCurrentData()
        .map(it => `<line>  ${JSON.stringify(it)},</line>`)
        .join("\n");
      document.getElementById(
        "__code"
      ).innerHTML = `<code><line>[</line>\n${html}\n<line>]</line></code>`;
      hljs.highlightAll();
    },
    false
  );
  oHideBtn.addEventListener(
    "click",
    () => {
      document.getElementById("__code").innerHTML = "";
    },
    false
  );
  oSaveBtn.addEventListener(
    "click",
    () => {
      const filename = prompt("Please input file name: ", "data");
      prompt && saveJsonToFile(window.d, filename);
    },
    false
  );

  function getCurrentData() {
    window.d = [].concat(
      window.d || [],
      Array.from(document.querySelectorAll("img.video-image")).map(e => ({
        title: e.alt.trim().split(" ")[0],
        cover: e.dataset.src.replace("ps.jpg", "pl.jpg").replace("pf_o1_", "pb_e_"),
      }))
    );
    window.d = uniqueArray(window.d);
    return window.d;
  }

  function saveJsonToFile(data, fileName = "data") {
    const jsonString = JSON.stringify(data);
    console.log(JSON.stringify(data, null, 2));
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName + ".json");
    link.click();
    URL.revokeObjectURL(url);
  }

  function uniqueArray(arr) {
    // 用一个 Map 来存储每个对象的 title 属性作为键
    const map = new Map();
    arr.forEach(obj => {
      map.set(obj.title, obj);
    });
    // 从 Map 中获取所有值，即去重后的对象数组
    return Array.from(map.values());
  }

  function genBtn(id, text) {
    const oBtn = document.createElement("button");
    oBtn.id = id;
    oBtn.textContent = text;
    oBtn.className = "action-btn";
    oBtn.type = "button";
    return oBtn;
  }
})();

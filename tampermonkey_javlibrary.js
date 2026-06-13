// ==UserScript==
// @name         JavLibrary Copy Info
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy video info as JSON
// @match        *://*.javlibrary.com/*
// @match        *://javlibrary.com/*
// @grant        GM_setClipboard
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_javlibrary.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_javlibrary.js
// ==/UserScript==

(function () {
  'use strict';

  function createButton () {
    const btn = document.createElement('button');

    btn.textContent = '复制信息';

    Object.assign(btn.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '99999',
      padding: '10px 16px',
      background: '#ff5722',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,.3)'
    });

    btn.addEventListener('click', copyInfo);

    document.body.appendChild(btn);
  }

  async function copyInfo () {
    const link = location.href;

    const desc =
      document.querySelector('#video_title a')?.textContent?.trim() ||
      document.querySelector('#video_title')?.textContent?.trim() ||
      '';

    const cover =
      document.querySelector('#video_jacket_img')?.src ||
      '';

    const title =
      document.querySelector('#video_id .text')?.textContent?.trim() ||
      '';

    const date =
      document.querySelector('#video_date .text')?.textContent?.trim() ||
      '';

    let thumb = '';
    let hash = '';

    if (cover) {
      const filename = cover.split('/').pop();

      // abc123pl.jpg -> abc123ps.jpg
      thumb = cover.replace(/pl\.jpg$/i, 'ps.jpg');

      // abc123pl.jpg -> abc123
      hash = filename.replace(/pl\.jpg$/i, '');

      // 兼容其它格式
      if (hash === filename) {
        hash = filename.replace(/\.[^.]+$/, '');
      }
    }

    const textToCopy = JSON.stringify({
      link,
      hash,
      desc,
      cover,
      thumb,
      title,
      date
    }) + ",";

    try {
      if (typeof GM_setClipboard === 'function') {
        GM_setClipboard(textToCopy);
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }

      showToast('已复制到剪贴板');
      console.log(textToCopy);
    } catch (err) {
      console.error(err);
      showToast('复制失败');
    }
  }

  function showToast (msg) {
    const toast = document.createElement('div');

    toast.textContent = msg;

    Object.assign(toast.style, {
      position: 'fixed',
      right: '20px',
      bottom: '70px',
      zIndex: '100000',
      background: 'rgba(0,0,0,.8)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '4px'
    });

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
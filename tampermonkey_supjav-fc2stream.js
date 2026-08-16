// ==UserScript==
// @name         SupJav - fc2stream
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  自动捕获 fc2stream.tv 的 m3u8，复制到剪贴板并保存为 m3u8 文件
// @match        https://supjav.com/*
// @match        http://supjav.com/*
// @match        https://fc2stream.tv/*
// @match        http://fc2stream.tv/*
// @match        https://*.fc2stream.tv/*
// @match        http://*.fc2stream.tv/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      fc2stream.tv
// @connect      *.fc2stream.tv
// @icon         https://www.google.com/s2/favicons?sz=64&domain=supjav.com
// @downloadURL  https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_supjav-fc2stream.js
// @updateURL    https://github.com/mai19950/tampermonkey/raw/main/tampermonkey_supjav-fc2stream.js
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_DOMAIN = 'fc2stream.tv';
  const TARGET_KEYWORD = 'index-f1-v1-a1.m3u8';
  let lastUrl = '';

  function isTargetUrl (url) {
    try {
      const absoluteUrl = new URL(url, location.href);
      const domainMatched =
        absoluteUrl.hostname === TARGET_DOMAIN ||
        absoluteUrl.hostname.endsWith('.' + TARGET_DOMAIN);
      return domainMatched && absoluteUrl.href.includes(TARGET_KEYWORD);
    } catch (e) {
      return false;
    }
  }

  function handleUrl (url, source) {
    if (!url || !isTargetUrl(url)) return;

    try {
      const m3u8Url = new URL(url, location.href).href;

      if (m3u8Url === lastUrl) return;
      lastUrl = m3u8Url;

      console.log(
        '%c[FC2STREAM] 找到 m3u8',
        'color: green; font-weight: bold;',
        m3u8Url
      );

      if (location.hostname === TARGET_DOMAIN ||
        location.hostname.endsWith('.' + TARGET_DOMAIN)) {
        window.top.postMessage({
          type: 'SUPJAV_M3U8',
          url: m3u8Url
        }, '*');
      } else {
        processM3u8(m3u8Url);
      }
    } catch (e) {
      console.error('[FC2STREAM] 处理 URL 失败:', e);
    }
  }

  function processM3u8 (m3u8Url) {
    console.log('[SUPJAV] 开始处理:', m3u8Url);

    GM_setClipboard(m3u8Url);

    console.log(
      '%c[SUPJAV] m3u8 URL 已复制到剪贴板',
      'color: blue; font-weight: bold;'
    );

    const title = document.title.trim() || 'video';
    const filename = sanitizeFilename(title) + '.m3u8';

    console.log('[SUPJAV] 文件名:', filename);

    GM_xmlhttpRequest({
      method: 'GET',
      url: m3u8Url,
      responseType: 'text',
      onload: function (response) {
        if (response.status < 200 || response.status >= 300) {
          console.error(
            '[SUPJAV] m3u8 请求失败:',
            response.status,
            response.statusText
          );
          return;
        }

        const content = response.responseText;

        console.log(
          '%c[SUPJAV] m3u8 获取成功，长度:',
          'color: green; font-weight: bold;',
          content.length
        );

        saveM3u8(content, filename);
      },
      onerror: function (error) {
        console.error('[SUPJAV] m3u8 请求失败:', error);
      },
      ontimeout: function () {
        console.error('[SUPJAV] m3u8 请求超时');
      }
    });
  }

  function sanitizeFilename (filename) {
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[. ]+$/, '') || 'video';
  }

  function saveM3u8 (content, filename) {
    const blob = new Blob(
      [content],
      { type: 'application/vnd.apple.mpegurl;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    console.log(
      '%c[SUPJAV] m3u8 已保存:',
      'color: green; font-weight: bold;',
      filename
    );
  }

  // 接收 fc2stream.tv iframe 发来的 m3u8 URL
  window.addEventListener('message', function (event) {
    if (
      event.origin !== 'https://fc2stream.tv' &&
      event.origin !== 'http://fc2stream.tv'
    ) {
      return;
    }

    if (!event.data || event.data.type !== 'SUPJAV_M3U8') {
      return;
    }

    const m3u8Url = event.data.url;

    if (!isTargetUrl(m3u8Url)) {
      return;
    }

    console.log(
      '%c[SUPJAV] 收到 iframe m3u8:',
      'color: orange; font-weight: bold;',
      m3u8Url
    );

    processM3u8(m3u8Url);
  });

  // XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    handleUrl(url, `XHR ${method}`);
    return originalOpen.call(this, method, url, ...args);
  };

  // fetch
  const originalFetch = window.fetch;

  window.fetch = function (input, init) {
    let url = null;

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    }

    handleUrl(url, 'fetch');

    return originalFetch.apply(this, arguments);
  };

  console.log(
    '%c[FC2STREAM] m3u8 监听器已启动:',
    'color: purple; font-weight: bold;',
    location.href
  );
})();
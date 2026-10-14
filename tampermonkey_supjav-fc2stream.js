// ==UserScript==
// @name         SupJav - m3u8 Downloader
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  自动捕获 fc2stream.tv / evsishere.xyz 的 m3u8 并保存
// @match        https://supjav.com/*
// @match        http://supjav.com/*
// @match        https://fc2stream.tv/*
// @match        http://fc2stream.tv/*
// @match        https://*.fc2stream.tv/*
// @match        http://*.fc2stream.tv/*
// @match        https://evsishere.xyz/*
// @match        http://evsishere.xyz/*
// @match        https://*.evsishere.xyz/*
// @match        http://*.evsishere.xyz/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      fc2stream.tv
// @connect      *.fc2stream.tv
// @connect      evsishere.xyz
// @connect      *.evsishere.xyz
// @icon         https://www.google.com/s2/favicons?sz=64&domain=supjav.com
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_DOMAINS = [
    'fc2stream.tv',
    'evsishere.xyz'
  ];

  const TARGET_KEYWORD = /index(?:-f1)?-v1-a1\.m3u8/;

  let lastUrl = '';
  const processedUrls = new Set();
  const pendingUrls = new Set();
  const fallbackTimers = new Map();

  function isTargetHost (hostname) {
    return TARGET_DOMAINS.some(domain =>
      hostname === domain ||
      hostname.endsWith('.' + domain)
    );
  }

  function isTargetUrl (url) {
    try {
      const parsedUrl = new URL(url, location.href);
      return isTargetHost(parsedUrl.hostname) &&
        TARGET_KEYWORD.test(parsedUrl.href);
    } catch (e) {
      return false;
    }
  }

  function normalizeUrl (url) {
    return new URL(url, location.href).href;
  }

  function isStreamPage () {
    return isTargetHost(location.hostname);
  }

  // =========================================================
  // 发现 m3u8 URL：只记录，不立即保存
  // =========================================================

  function handleUrl (url, source) {
    if (!url || !isTargetUrl(url)) return;

    let m3u8Url;

    try {
      m3u8Url = normalizeUrl(url);
    } catch (e) {
      return;
    }

    if (m3u8Url === lastUrl) return;
    lastUrl = m3u8Url;

    console.log(
      '[M3U8] 找到 URL (' + source + '):',
      m3u8Url
    );

    if (isStreamPage() && window.top !== window) {
      window.top.postMessage({
        type: 'SUPJAV_M3U8_URL',
        url: m3u8Url
      }, '*');
    } else if (!isStreamPage()) {
      scheduleFallback(m3u8Url);
    }
  }

  // =========================================================
  // 延迟备用请求
  // 如果浏览器响应先到，会取消备用请求
  // =========================================================

  function scheduleFallback (m3u8Url) {
    if (
      processedUrls.has(m3u8Url) ||
      pendingUrls.has(m3u8Url) ||
      fallbackTimers.has(m3u8Url)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fallbackTimers.delete(m3u8Url);

      if (!processedUrls.has(m3u8Url)) {
        processM3u8(m3u8Url);
      }
    }, 2000);

    fallbackTimers.set(m3u8Url, timer);
  }

  function clearFallback (m3u8Url) {
    const timer = fallbackTimers.get(m3u8Url);

    if (timer) {
      clearTimeout(timer);
      fallbackTimers.delete(m3u8Url);
    }
  }

  // =========================================================
  // 统一处理：同一个 URL 只保存一次
  // =========================================================

  function processM3u8 (m3u8Url, content = null) {
    try {
      m3u8Url = normalizeUrl(m3u8Url);
    } catch (e) {
      return;
    }

    if (!isTargetUrl(m3u8Url)) return;

    if (processedUrls.has(m3u8Url)) {
      console.log('[M3U8] 已保存，跳过:', m3u8Url);
      return;
    }

    if (pendingUrls.has(m3u8Url)) {
      return;
    }

    clearFallback(m3u8Url);
    pendingUrls.add(m3u8Url);

    GM_setClipboard(m3u8Url);

    // 在保存页面取标题；SupJav 页面使用其 document.title
    const title = document.title.trim() || 'video';
    const filename = sanitizeFilename(title) + '.m3u8';

    if (
      typeof content === 'string' &&
      content.trim().startsWith('#EXTM3U')
    ) {
      processedUrls.add(m3u8Url);
      pendingUrls.delete(m3u8Url);
      saveM3u8(content, filename);
      return;
    }

    requestM3u8WithGM(m3u8Url, filename);
  }

  // =========================================================
  // GM 请求备用方案
  // =========================================================

  function requestM3u8WithGM (m3u8Url, filename) {
    console.log('[M3U8] 尝试使用 GM 请求:', m3u8Url);

    GM_xmlhttpRequest({
      method: 'GET',
      url: m3u8Url,
      headers: {
        'Referer': location.href,
        'Origin': location.origin,
        'Accept': '*/*'
      },
      anonymous: false,
      responseType: 'text',

      onload (response) {
        if (response.status < 200 || response.status >= 300) {
          pendingUrls.delete(m3u8Url);
          console.error('[M3U8] GM 请求失败:', response.status, m3u8Url);
          return;
        }

        const content = response.responseText;

        if (
          typeof content !== 'string' ||
          !content.trim().startsWith('#EXTM3U')
        ) {
          pendingUrls.delete(m3u8Url);
          console.error('[M3U8] 返回内容不是有效的 m3u8:', m3u8Url);
          return;
        }

        if (processedUrls.has(m3u8Url)) {
          pendingUrls.delete(m3u8Url);
          return;
        }

        processedUrls.add(m3u8Url);
        pendingUrls.delete(m3u8Url);
        saveM3u8(content, filename);
      },

      onerror (error) {
        pendingUrls.delete(m3u8Url);
        console.error('[M3U8] GM 请求错误:', error);
      },

      ontimeout () {
        pendingUrls.delete(m3u8Url);
        console.error('[M3U8] GM 请求超时:', m3u8Url);
      }
    });
  }

  // =========================================================
  // 清理文件名
  // =========================================================

  function sanitizeFilename (filename) {
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[. ]+$/, '') || 'video';
  }

  // =========================================================
  // 保存文件
  // =========================================================

  function saveM3u8 (content, filename) {
    const blob = new Blob([content], {
      type: 'application/vnd.apple.mpegurl;charset=utf-8'
    });

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = objectUrl;
    a.download = filename;
    a.style.display = 'none';

    (document.body || document.documentElement).appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

    console.log('[M3U8] 已保存:', filename);
  }

  // =========================================================
  // 接收 iframe 消息
  // =========================================================

  window.addEventListener('message', function (event) {
    let senderHost;

    try {
      senderHost = new URL(event.origin).hostname;
    } catch (e) {
      return;
    }

    if (!isTargetHost(senderHost) || !event.data) return;

    const { type, url, content } = event.data;

    if (!isTargetUrl(url)) return;

    if (type === 'SUPJAV_M3U8_URL') {
      scheduleFallback(url);
      return;
    }

    if (type === 'SUPJAV_M3U8_CONTENT') {
      processM3u8(url, content);
    }
  });

  // =========================================================
  // XMLHttpRequest 拦截
  // =========================================================

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    this.__supjav_url = url;
    handleUrl(url, 'XHR ' + method);

    return originalOpen.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    const xhr = this;

    if (xhr.__supjav_url && isTargetUrl(xhr.__supjav_url)) {
      xhr.addEventListener('load', function () {
        try {
          if (
            xhr.status < 200 ||
            xhr.status >= 300 ||
            typeof xhr.responseText !== 'string' ||
            !xhr.responseText.trim().startsWith('#EXTM3U')
          ) {
            return;
          }

          const m3u8Url = xhr.responseURL ||
            normalizeUrl(xhr.__supjav_url);

          console.log('[M3U8] 捕获 XHR 响应:', m3u8Url);

          if (isStreamPage() && window.top !== window) {
            window.top.postMessage({
              type: 'SUPJAV_M3U8_CONTENT',
              url: m3u8Url,
              content: xhr.responseText
            }, '*');
          } else {
            processM3u8(m3u8Url, xhr.responseText);
          }
        } catch (e) {
          console.error('[M3U8] 读取 XHR 响应失败:', e);
        }
      });
    }

    return originalSend.apply(this, args);
  };

  // =========================================================
  // fetch 拦截
  // =========================================================

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

    const promise = originalFetch.apply(this, arguments);

    if (url && isTargetUrl(url)) {
      promise.then(response => {
        if (!response.ok) return;

        const responseUrl = response.url || normalizeUrl(url);

        return response.clone().text().then(content => {
          if (
            typeof content !== 'string' ||
            !content.trim().startsWith('#EXTM3U')
          ) {
            return;
          }

          console.log('[M3U8] 捕获 fetch 响应:', responseUrl);

          if (isStreamPage() && window.top !== window) {
            window.top.postMessage({
              type: 'SUPJAV_M3U8_CONTENT',
              url: responseUrl,
              content
            }, '*');
          } else {
            processM3u8(responseUrl, content);
          }
        });
      }).catch(error => {
        console.error('[M3U8] 读取 fetch 响应失败:', error);
      });
    }

    return promise;
  };

  console.log('[M3U8] 监听器已启动:', location.href);
})();


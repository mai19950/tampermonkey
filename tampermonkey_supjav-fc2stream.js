// ==UserScript==
// @name         SupJav - fc2stream
// @namespace    http://tampermonkey.net/
// @version      1.3
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
  const TARGET_KEYWORD = /index(?:-f1)?-v1-a1\.m3u8/;

  let lastUrl = '';
  const processedUrls = new Set();
  const pendingUrls = new Set();

  function isTargetUrl (url) {
    try {
      const absoluteUrl = new URL(url, location.href);

      const domainMatched =
        absoluteUrl.hostname === TARGET_DOMAIN ||
        absoluteUrl.hostname.endsWith('.' + TARGET_DOMAIN);

      return domainMatched && TARGET_KEYWORD.test(absoluteUrl.href);
    } catch (e) {
      return false;
    }
  }

  function normalizeUrl (url) {
    return new URL(url, location.href).href;
  }

  // =========================================================
  // 发现 m3u8 URL
  //
  // 注意：这里只记录 URL，不保存文件
  // =========================================================

  function handleUrl (url, source) {
    if (!url || !isTargetUrl(url)) return;

    try {
      const m3u8Url = normalizeUrl(url);

      if (m3u8Url === lastUrl) return;

      lastUrl = m3u8Url;

      console.log(
        '%c[FC2STREAM] 找到 m3u8',
        'color: green; font-weight: bold;',
        source,
        m3u8Url
      );

      // iframe 通知父页面 URL
      if (
        location.hostname === TARGET_DOMAIN ||
        location.hostname.endsWith('.' + TARGET_DOMAIN)
      ) {
        window.top.postMessage({
          type: 'SUPJAV_M3U8_URL',
          url: m3u8Url
        }, '*');
      }

    } catch (e) {
      console.error('[FC2STREAM] 处理 URL 失败:', e);
    }
  }

  // =========================================================
  // 最终处理 m3u8
  //
  // 同一个 URL 无论通过哪条路径进入，都只处理一次
  // =========================================================

  function processM3u8 (m3u8Url, content = null) {
    try {
      m3u8Url = normalizeUrl(m3u8Url);
    } catch (e) {
      return;
    }

    if (!isTargetUrl(m3u8Url)) return;

    // 已经保存过
    if (processedUrls.has(m3u8Url)) {
      console.log(
        '[SUPJAV] 此 m3u8 已保存，跳过:',
        m3u8Url
      );
      return;
    }

    // 正在处理
    if (pendingUrls.has(m3u8Url)) {
      console.log(
        '[SUPJAV] 此 m3u8 正在处理，跳过:',
        m3u8Url
      );
      return;
    }

    pendingUrls.add(m3u8Url);

    console.log(
      '[SUPJAV] 开始处理:',
      m3u8Url
    );

    GM_setClipboard(m3u8Url);

    const title = document.title.trim() || 'video';
    const filename = sanitizeFilename(title) + '.m3u8';

    // 浏览器已经获取到 m3u8 内容
    if (
      typeof content === 'string' &&
      content.trim().startsWith('#EXTM3U')
    ) {
      console.log(
        '%c[SUPJAV] 使用浏览器已获取的 m3u8',
        'color: green; font-weight: bold;'
      );

      processedUrls.add(m3u8Url);
      pendingUrls.delete(m3u8Url);

      saveM3u8(content, filename);
      return;
    }

    // 没有浏览器 response，使用 GM 作为 fallback
    requestM3u8WithGM(
      m3u8Url,
      filename
    );
  }

  // =========================================================
  // GM_xmlhttpRequest fallback
  // =========================================================

  function requestM3u8WithGM (m3u8Url, filename) {
    console.log(
      '%c[SUPJAV] 浏览器没有捕获到响应，使用 GM 请求:',
      'color: orange; font-weight: bold;',
      m3u8Url
    );

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

      onload: function (response) {
        console.log(
          '[SUPJAV] GM 请求:',
          response.status,
          response.statusText
        );

        if (
          response.status < 200 ||
          response.status >= 300
        ) {
          pendingUrls.delete(m3u8Url);

          console.error(
            '[SUPJAV] m3u8 请求失败:',
            response.status,
            response.statusText
          );

          return;
        }

        const content = response.responseText;

        if (
          typeof content !== 'string' ||
          !content.trim().startsWith('#EXTM3U')
        ) {
          pendingUrls.delete(m3u8Url);

          console.error(
            '[SUPJAV] 返回内容不是 m3u8'
          );

          return;
        }

        processedUrls.add(m3u8Url);
        pendingUrls.delete(m3u8Url);

        saveM3u8(
          content,
          filename
        );
      },

      onerror: function (error) {
        pendingUrls.delete(m3u8Url);

        console.error(
          '[SUPJAV] m3u8 请求错误:',
          error
        );
      },

      ontimeout: function () {
        pendingUrls.delete(m3u8Url);

        console.error(
          '[SUPJAV] m3u8 请求超时'
        );
      }
    });
  }

  // =========================================================
  // 文件名
  // =========================================================

  function sanitizeFilename (filename) {
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[. ]+$/, '') || 'video';
  }

  // =========================================================
  // 保存 m3u8
  // =========================================================

  function saveM3u8 (content, filename) {
    const blob = new Blob(
      [content],
      {
        type: 'application/vnd.apple.mpegurl;charset=utf-8'
      }
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

  // =========================================================
  // 接收 fc2stream iframe 消息
  // =========================================================

  window.addEventListener('message', function (event) {
    if (
      event.origin !== 'https://fc2stream.tv' &&
      event.origin !== 'http://fc2stream.tv'
    ) {
      return;
    }

    if (!event.data) return;

    // -----------------------------------------
    // 只收到 URL
    // 不保存
    // -----------------------------------------

    if (
      event.data.type === 'SUPJAV_M3U8_URL'
    ) {
      const m3u8Url = event.data.url;

      if (!isTargetUrl(m3u8Url)) {
        return;
      }

      console.log(
        '%c[SUPJAV] 收到 iframe m3u8 URL:',
        'color: orange; font-weight: bold;',
        m3u8Url
      );

      return;
    }

    // -----------------------------------------
    // 收到浏览器已经获取的完整 m3u8
    // -----------------------------------------

    if (
      event.data.type === 'SUPJAV_M3U8_CONTENT'
    ) {
      const m3u8Url = event.data.url;
      const content = event.data.content;

      if (!isTargetUrl(m3u8Url)) {
        return;
      }

      console.log(
        '%c[SUPJAV] 收到 iframe m3u8 内容',
        'color: green; font-weight: bold;',
        m3u8Url
      );

      processM3u8(
        m3u8Url,
        content
      );
    }
  });

  // =========================================================
  // XMLHttpRequest
  // =========================================================

  const originalOpen =
    XMLHttpRequest.prototype.open;

  const originalSend =
    XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method,
    url,
    ...args
  ) {
    this.__supjav_url = url;

    handleUrl(
      url,
      `XHR ${method}`
    );

    return originalOpen.call(
      this,
      method,
      url,
      ...args
    );
  };

  XMLHttpRequest.prototype.send = function (...args) {
    const xhr = this;

    if (
      xhr.__supjav_url &&
      isTargetUrl(xhr.__supjav_url)
    ) {
      xhr.addEventListener(
        'load',
        function () {
          try {
            if (
              xhr.status >= 200 &&
              xhr.status < 300 &&
              typeof xhr.responseText === 'string' &&
              xhr.responseText.trim().startsWith('#EXTM3U')
            ) {
              const m3u8Url =
                xhr.responseURL ||
                normalizeUrl(
                  xhr.__supjav_url
                );

              console.log(
                '%c[FC2STREAM] 捕获 XHR m3u8 响应',
                'color: cyan; font-weight: bold;',
                m3u8Url
              );

              // 如果当前是 iframe，交给父页面保存
              if (
                location.hostname === TARGET_DOMAIN ||
                location.hostname.endsWith('.' + TARGET_DOMAIN)
              ) {
                window.top.postMessage({
                  type: 'SUPJAV_M3U8_CONTENT',
                  url: m3u8Url,
                  content: xhr.responseText
                }, '*');
              } else {
                // 当前就是 SupJav 页面
                processM3u8(
                  m3u8Url,
                  xhr.responseText
                );
              }
            }
          } catch (e) {
            console.error(
              '[FC2STREAM] 读取 XHR m3u8 响应失败:',
              e
            );
          }
        }
      );
    }

    return originalSend.apply(
      this,
      args
    );
  };

  // =========================================================
  // fetch
  // =========================================================

  const originalFetch =
    window.fetch;

  window.fetch = function (
    input,
    init
  ) {
    let url = null;

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    }

    handleUrl(
      url,
      'fetch'
    );

    const promise =
      originalFetch.apply(
        this,
        arguments
      );

    if (
      url &&
      isTargetUrl(url)
    ) {
      promise
        .then(response => {
          if (!response.ok) {
            return;
          }

          const responseUrl =
            response.url || url;

          return response
            .clone()
            .text()
            .then(content => {
              if (
                typeof content !== 'string' ||
                !content.trim().startsWith('#EXTM3U')
              ) {
                return;
              }

              console.log(
                '%c[FC2STREAM] 捕获 fetch m3u8 响应',
                'color: cyan; font-weight: bold;',
                responseUrl
              );

              // iframe → 父页面
              if (
                location.hostname === TARGET_DOMAIN ||
                location.hostname.endsWith('.' + TARGET_DOMAIN)
              ) {
                window.top.postMessage({
                  type: 'SUPJAV_M3U8_CONTENT',
                  url: responseUrl,
                  content: content
                }, '*');
              } else {
                // 当前就是 SupJav 页面
                processM3u8(
                  responseUrl,
                  content
                );
              }
            });
        })
        .catch(error => {
          console.error(
            '[FC2STREAM] 读取 fetch m3u8 失败:',
            error
          );
        });
    }

    return promise;
  };

  console.log(
    '%c[FC2STREAM] m3u8 监听器已启动:',
    'color: purple; font-weight: bold;',
    location.href
  );

})();
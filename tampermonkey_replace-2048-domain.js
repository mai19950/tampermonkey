// ==UserScript==
// @name         replace-2048-domain
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  替换当前网站的域名并自动重定向
// @author       Your Name
// @match        https://*/2048/*.php*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // 定义新的域名
  const newDomain = 'bbs.eyz8.com';

  // 获取当前页面的主机名
  let currentHostname = window.location.hostname;

  // 如果当前主机名与新域名不同，则进行重定向
  if (currentHostname !== newDomain) {
      let newUrl = window.location.href.replace(currentHostname, newDomain);
      window.location.replace(newUrl);
  }

})();

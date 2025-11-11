"use strict";
const common_vendor = require("../common/vendor.js");
function formatTime(timestamp) {
  const now = (/* @__PURE__ */ new Date()).getTime();
  const diff = now - timestamp;
  if (diff < 6e4) {
    return "刚刚";
  } else if (diff < 36e5) {
    return Math.floor(diff / 6e4) + "分钟前";
  } else if (diff < 864e5) {
    return Math.floor(diff / 36e5) + "小时前";
  } else if (diff < 6048e5) {
    return Math.floor(diff / 864e5) + "天前";
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
}
function formatDate(date, format = "yyyy-MM-dd") {
  if (!(date instanceof Date)) {
    try {
      if (typeof date === "number" || typeof date === "string" && !isNaN(Number(date))) {
        const timestamp = Number(date);
        date = new Date(timestamp);
      } else {
        date = new Date(date);
      }
      if (isNaN(date.getTime())) {
        common_vendor.index.__f__("error", "at utils/common.js:37", "无效的日期:", date);
        return "无效日期";
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/common.js:41", "日期转换错误:", error, "原始值:", date);
      return "日期错误";
    }
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return format.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("hh", hours).replace("mm", minutes).replace("ss", seconds);
}
function getImageUrl(url, defaultUrl = "/static/images/default-poster.png", addTimestamp = true) {
  if (!url)
    return defaultUrl;
  try {
    let cleanUrl = url;
    if (url.includes("?t=") || url.includes("&t=")) {
      cleanUrl = url.replace(/[?&]t=\d+/g, "");
    }
    if (addTimestamp) {
      const timestamp = (/* @__PURE__ */ new Date()).getTime();
      return cleanUrl.includes("?") ? `${cleanUrl}&t=${timestamp}` : `${cleanUrl}?t=${timestamp}`;
    } else {
      return cleanUrl;
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/common.js:99", "处理图片URL出错:", e);
    return url || defaultUrl;
  }
}
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.getImageUrl = getImageUrl;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/common.js.map

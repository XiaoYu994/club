"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("./auth.js");
class Request {
  constructor() {
    this.baseURL = "http://localhost:8081";
    this.timeout = 3e4;
    this.header = {
      "content-type": "application/json"
    };
  }
  // 设置请求头
  setHeader(header) {
    this.header = Object.assign(this.header, header);
    return this;
  }
  // 修正setConfig方法
  setConfig(config) {
    if (config.baseURL) {
      this.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.timeout = config.timeout;
    }
    if (config.header) {
      this.header = Object.assign(this.header, config.header);
    }
    return this;
  }
  // 获取完整URL（添加debug日志）
  getUrl(url) {
    if (url.startsWith("http")) {
      return url;
    }
    const fullUrl = this.baseURL + url;
    return fullUrl;
  }
  // 发起请求的核心方法
  request(options = {}) {
    return new Promise((resolve, reject) => {
      let token = null;
      let headerKey = "authentication";
      if (options.url.startsWith("/admin")) {
        token = common_vendor.index.getStorageSync("adminToken");
        headerKey = "token";
      } else {
        token = common_vendor.index.getStorageSync("token");
      }
      if (token) {
        this.header[headerKey] = `Bearer ${token}`;
      }
      common_vendor.index.request({
        url: this.getUrl(options.url),
        method: options.method || "GET",
        data: options.data,
        header: this.header,
        timeout: this.timeout,
        success: (res) => {
          var _a;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (res.data && res.data.code !== void 0) {
              if (res.data.code === 200) {
                resolve(res.data);
              } else {
                setTimeout(() => {
                  common_vendor.index.showToast({
                    title: res.data.message || "操作失败",
                    icon: "none",
                    duration: 2500
                  });
                }, 100);
                reject(res.data);
              }
            } else {
              resolve(res.data);
            }
          } else if (res.statusCode === 401) {
            if (options.url.startsWith("/admin")) {
              common_vendor.index.showToast({
                title: "管理员登录已过期，请重新登录",
                icon: "none"
              });
              common_vendor.index.removeStorageSync("adminToken");
              common_vendor.index.removeStorageSync("adminInfo");
              setTimeout(() => {
                common_vendor.index.navigateTo({
                  url: "/pages/admin/login"
                });
              }, 1500);
            } else {
              common_vendor.index.showToast({
                title: "登录已过期，请重新登录",
                icon: "none"
              });
              common_vendor.index.removeStorageSync("token");
              try {
                utils_auth.removeUser();
              } catch (e) {
              }
              setTimeout(() => {
                common_vendor.index.navigateTo({
                  url: "/pages/user/login"
                });
              }, 1500);
            }
            reject(res);
          } else {
            common_vendor.index.showToast({
              title: ((_a = res.data) == null ? void 0 : _a.message) || "请求失败",
              icon: "none"
            });
            reject(res);
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络异常",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at utils/request.js:142", "请求失败:", err);
          reject(err);
        }
      });
    });
  }
  // GET请求
  get(url, params = {}) {
    return this.request({
      url: params ? `${url}${this.paramsToString(params)}` : url,
      method: "GET"
    });
  }
  // POST请求
  post(url, data = {}) {
    return this.request({
      url,
      method: "POST",
      data
    });
  }
  // PUT请求
  put(url, data = {}) {
    return this.request({
      url,
      method: "PUT",
      data
    });
  }
  // DELETE请求
  delete(url, data = {}) {
    return this.request({
      url,
      method: "DELETE",
      data
    });
  }
  // PATCH请求
  patch(url, data = {}) {
    return this.request({
      url,
      method: "PATCH",
      data
    });
  }
  // 将参数转换为查询字符串
  paramsToString(params) {
    if (!params)
      return "";
    return "?" + Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
  }
  // 文件上传
  upload(url, filePath, formData = {}, name = "file") {
    return new Promise((resolve, reject) => {
      let token = null;
      let headerKey = "Authorization";
      if (url.startsWith("/admin")) {
        token = common_vendor.index.getStorageSync("adminToken");
      } else {
        token = common_vendor.index.getStorageSync("token");
      }
      const header = { ...this.header };
      if (token) {
        header[headerKey] = `Bearer ${token}`;
      }
      common_vendor.index.uploadFile({
        url: this.getUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            let data = res.data;
            if (typeof data === "string") {
              try {
                data = JSON.parse(data);
              } catch (e) {
                common_vendor.index.__f__("error", "at utils/request.js:235", "上传响应数据解析失败", e);
              }
            }
            resolve(data);
          } else {
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
            reject(res);
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at utils/request.js:252", "上传失败:", err);
          reject(err);
        }
      });
    });
  }
}
const request = new Request();
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map

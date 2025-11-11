"use strict";
const common_vendor = require("../common/vendor.js");
const TOKEN_KEY = "token";
const USER_INFO_KEY = "club_user_info";
function getToken() {
  return common_vendor.index.getStorageSync(TOKEN_KEY) || null;
}
function setUser(userInfo) {
  common_vendor.index.setStorageSync(USER_INFO_KEY, userInfo);
}
function getUser() {
  return common_vendor.index.getStorageSync(USER_INFO_KEY) || null;
}
function removeUser() {
  common_vendor.index.removeStorageSync(USER_INFO_KEY);
}
exports.getToken = getToken;
exports.getUser = getUser;
exports.removeUser = removeUser;
exports.setUser = setUser;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map

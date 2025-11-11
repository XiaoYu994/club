"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const agreeProtocol = common_vendor.ref(false);
    const showModal = common_vendor.ref(false);
    function showLoginModal() {
      if (!agreeProtocol.value) {
        common_vendor.index.showToast({ title: "请先同意协议", icon: "none" });
        return;
      }
      showModal.value = true;
    }
    function cancelLogin() {
      showModal.value = false;
    }
    async function confirmLogin() {
      showModal.value = false;
      try {
        const loginResult = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        if (loginResult && loginResult.code) {
          common_vendor.index.__f__("log", "at pages/user/login.vue:77", "微信登录code:", loginResult.code);
          const res = await proxy.$api.user.wxLogin(loginResult.code);
          if (res.code === 200) {
            common_vendor.index.setStorageSync("token", res.data.token);
            utils_auth.setUser(res.data);
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({ url: "/pages/user/user" });
            }, 1500);
          }
        } else {
          throw new Error("获取登录凭证失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/login.vue:101", "登录失败", error);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      }
    }
    async function phoneLogin() {
      if (!agreeProtocol.value) {
        common_vendor.index.showToast({ title: "请先同意协议", icon: "none" });
        return;
      }
      const res = await proxy.$api.user.wxLogin("phoneLogin");
      common_vendor.index.__f__("log", "at pages/user/login.vue:119", res.data);
      if (res.code === 200) {
        common_vendor.index.setStorageSync("token", res.data.token);
        utils_auth.setUser(res.data);
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({ url: "/pages/user/user" });
        }, 1500);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: common_assets._imports_1,
        c: common_vendor.o(showLoginModal),
        d: common_vendor.o(phoneLogin),
        e: agreeProtocol.value,
        f: common_vendor.o(($event) => agreeProtocol.value = !agreeProtocol.value),
        g: showModal.value
      }, showModal.value ? {
        h: common_vendor.o(cancelLogin),
        i: common_vendor.o(confirmLogin)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6163e5ce"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/login.js.map

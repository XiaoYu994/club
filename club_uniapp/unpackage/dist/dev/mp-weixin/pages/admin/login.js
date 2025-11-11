"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_api = require("../../api/api.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const username = common_vendor.ref("");
    const password = common_vendor.ref("");
    const handleLogin = async () => {
      if (!username.value || !password.value) {
        common_vendor.index.showToast({
          title: "账号密码不能为空",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "登录中..." });
        const response = await api_api.apiModule.admin.login({
          username: username.value,
          password: password.value
        });
        if (response.code === 200) {
          common_vendor.index.setStorageSync("adminToken", response.data.token);
          common_vendor.index.setStorageSync("adminInfo", response.data);
          common_vendor.index.reLaunch({
            url: "/pages/admin/index"
          });
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/login.vue:96", "登录失败:", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onLoad(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (token) {
        common_vendor.index.reLaunch({
          url: "/pages/admin/index"
        });
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$7,
        b: common_vendor.p({
          type: "person",
          size: "20",
          color: "#999"
        }),
        c: username.value,
        d: common_vendor.o(($event) => username.value = $event.detail.value),
        e: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#999"
        }),
        f: password.value,
        g: common_vendor.o(($event) => password.value = $event.detail.value),
        h: !username.value || !password.value,
        i: !username.value || !password.value ? 1 : "",
        j: common_vendor.o(handleLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3190821f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/login.js.map

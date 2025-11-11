"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  _easycom_custom_nav_bar2();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
if (!Math) {
  _easycom_custom_nav_bar();
}
const _sfc_main = {
  __name: "password",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const form = common_vendor.reactive({
      oldPassword: "",
      newPassword: ""
    });
    const confirmPassword = common_vendor.ref("");
    async function updatePassword() {
      try {
        if (!form.oldPassword) {
          common_vendor.index.showToast({
            title: "请输入旧密码",
            icon: "none"
          });
          return;
        }
        if (!form.newPassword) {
          common_vendor.index.showToast({
            title: "请输入新密码",
            icon: "none"
          });
          return;
        }
        if (form.newPassword.length < 6) {
          common_vendor.index.showToast({
            title: "新密码长度不能小于6位",
            icon: "none"
          });
          return;
        }
        if (form.newPassword !== confirmPassword.value) {
          common_vendor.index.showToast({
            title: "两次输入的新密码不一致",
            icon: "none"
          });
          return;
        }
        const res = await proxy.$api.admin.updatePassword(form);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "密码修改成功",
            icon: "success"
          });
          form.oldPassword = "";
          form.newPassword = "";
          confirmPassword.value = "";
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || "密码修改失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/password.vue:102", "密码修改失败", error);
        common_vendor.index.showToast({
          title: "密码修改失败",
          icon: "none"
        });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "修改密码"
        }),
        b: form.oldPassword,
        c: common_vendor.o(($event) => form.oldPassword = $event.detail.value),
        d: form.newPassword,
        e: common_vendor.o(($event) => form.newPassword = $event.detail.value),
        f: confirmPassword.value,
        g: common_vendor.o(($event) => confirmPassword.value = $event.detail.value),
        h: common_vendor.o(updatePassword)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-347e94c2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/password.js.map

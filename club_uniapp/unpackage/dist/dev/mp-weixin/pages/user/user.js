"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_template = common_vendor.resolveComponent("template");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _component_template + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const isLoggedIn = common_vendor.ref(false);
    const editPopup = common_vendor.ref(null);
    const user = common_vendor.ref({});
    const editForm = common_vendor.reactive({
      avatar: "",
      username: "",
      gender: 1,
      mobile: "",
      email: "",
      studentId: "",
      college: "",
      major: "",
      className: ""
    });
    const collegeOptions = [
      "信息工程学院",
      "电子信息学院",
      "机械工程学院",
      "经济管理学院",
      "外国语学院",
      "艺术学院",
      "其他学院"
    ];
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        isLoggedIn.value = true;
      }
      getUserInfo();
    });
    common_vendor.onActivated(() => {
      const token = common_vendor.index.getStorageSync("token");
      isLoggedIn.value = !!token;
      if (token) {
        getUserInfo();
      } else {
        user.value = {};
      }
    });
    async function getUserInfo() {
      try {
        const res = await proxy.$api.user.getUserInfo();
        if (res.code === 200) {
          user.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:228", "获取用户信息失败", error);
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
      }
    }
    function initEditForm() {
      if (!user.value) {
        user.value = {};
      }
      editForm.avatar = user.value.avatar || "/static/images/avatar-default.png";
      editForm.username = user.value.username || "";
      editForm.gender = user.value.gender || 1;
      editForm.mobile = user.value.mobile || "";
      editForm.email = user.value.email || "";
      editForm.studentId = user.value.studentId || "";
      editForm.college = user.value.college || "";
      editForm.major = user.value.major || "";
      editForm.className = user.value.className || "";
    }
    async function editProfile() {
      try {
        await getUserInfo();
        initEditForm();
        editPopup.value.open();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:263", "获取用户信息失败", error);
        initEditForm();
        editPopup.value.open();
      }
    }
    function closeEditPopup() {
      editPopup.value.close();
    }
    async function saveUserInfo() {
      try {
        if (editForm.avatar && !editForm.avatar.startsWith("http")) {
          const uploadRes = await proxy.$api.common.upload(editForm.avatar);
          common_vendor.index.__f__("log", "at pages/user/user.vue:281", "上传头像结果:", uploadRes);
          if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
            editForm.avatar = uploadRes.data.url;
          } else {
            common_vendor.index.showToast({ title: "头像上传失败", icon: "none" });
            return;
          }
        }
        common_vendor.index.__f__("log", "at pages/user/user.vue:290", editForm);
        const res = await proxy.$api.user.updateUserInfo(editForm);
        if (res.code === 200) {
          closeEditPopup();
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          await getUserInfo();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:307", "保存失败", error);
      }
    }
    async function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            const uploadRes = await proxy.$api.common.upload(tempFilePath);
            if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
              const newUrl = uploadRes.data.url;
              const updateRes = await proxy.$api.user.updateUserInfo({ avatar: newUrl });
              if (updateRes.code === 200) {
                user.value.avatar = newUrl;
                editForm.avatar = newUrl;
                common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
              } else {
                common_vendor.index.showToast({ title: updateRes.msg || "头像更新失败", icon: "none" });
              }
            } else {
              common_vendor.index.showToast({ title: uploadRes.msg || "上传失败", icon: "none" });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/user/user.vue:342", "上传头像失败", error);
            common_vendor.index.showToast({ title: "上传失败", icon: "none" });
          }
        }
      });
    }
    function onGenderChange(e) {
      editForm.gender = parseInt(e.detail.value);
    }
    function onCollegeChange(e) {
      const index = e.detail.value;
      editForm.college = collegeOptions[index];
    }
    function goMyClubs() {
      common_vendor.index.navigateTo({ url: "/pages/user/myClubs" });
    }
    function goMyActivities() {
      common_vendor.index.navigateTo({ url: "/pages/user/myActivities" });
    }
    function goMyMessages() {
      common_vendor.index.navigateTo({ url: "/pages/notification/notification" });
    }
    function goMyApplies() {
      common_vendor.index.navigateTo({ url: "/pages/user/myApplies" });
    }
    function goSetting() {
      common_vendor.index.navigateTo({ url: "/pages/admin/login" });
    }
    function goAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: `校园社团管理小程序
版本：v1.0.0
开发者：肖恒昱
联系方式：2489927141@qq.com
© 2025 `,
        showCancel: false,
        confirmText: "我知道了"
      });
    }
    function logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            isLoggedIn.value = false;
            common_vendor.index.removeStorageSync("token");
            utils_auth.removeUser();
            user.value = {};
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/user/login"
              });
            }, 500);
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "我的"
        }),
        b: user.value.avatar || "/static/images/avatar-default.png",
        c: common_vendor.o(chooseAvatar),
        d: common_vendor.t(user.value.username || "未设置"),
        e: common_vendor.t(user.value.studentId || "未绑定学号"),
        f: common_vendor.t(user.value.college || "未绑定学院"),
        g: common_vendor.o(editProfile),
        h: common_vendor.p({
          type: "star",
          size: "28",
          color: "#ffb300"
        }),
        i: common_vendor.o(goMyClubs),
        j: common_vendor.p({
          type: "calendar",
          size: "28",
          color: "#2a5fff"
        }),
        k: common_vendor.o(goMyActivities),
        l: common_vendor.p({
          type: "email",
          size: "28",
          color: "#22e58b"
        }),
        m: common_vendor.o(goMyMessages),
        n: common_vendor.p({
          type: "paperplane",
          size: "28",
          color: "#ff6b6b"
        }),
        o: common_vendor.o(goMyApplies),
        p: common_vendor.p({
          type: "gear",
          size: "22",
          color: "#888"
        }),
        q: common_vendor.p({
          type: "right",
          size: "18",
          color: "#bbb"
        }),
        r: common_vendor.o(goSetting),
        s: common_vendor.p({
          type: "chat",
          size: "22",
          color: "#888"
        }),
        t: common_vendor.p({
          type: "right",
          size: "18",
          color: "#bbb"
        }),
        v: common_vendor.p({
          type: "info",
          size: "22",
          color: "#888"
        }),
        w: common_vendor.p({
          type: "right",
          size: "18",
          color: "#bbb"
        }),
        x: common_vendor.o(goAbout),
        y: common_vendor.o(logout),
        z: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        A: common_vendor.o(closeEditPopup),
        B: editForm.avatar,
        C: common_vendor.p({
          type: "camera",
          size: "20",
          color: "#fff"
        }),
        D: common_vendor.o(chooseAvatar),
        E: editForm.username,
        F: common_vendor.o(($event) => editForm.username = $event.detail.value),
        G: editForm.gender === 1,
        H: editForm.gender === 2,
        I: common_vendor.o(onGenderChange),
        J: editForm.mobile,
        K: common_vendor.o(($event) => editForm.mobile = $event.detail.value),
        L: editForm.email,
        M: common_vendor.o(($event) => editForm.email = $event.detail.value),
        N: editForm.studentId,
        O: common_vendor.o(($event) => editForm.studentId = $event.detail.value),
        P: common_vendor.t(editForm.college || "请选择学院"),
        Q: collegeOptions,
        R: common_vendor.o(onCollegeChange),
        S: editForm.major,
        T: common_vendor.o(($event) => editForm.major = $event.detail.value),
        U: editForm.className,
        V: common_vendor.o(($event) => editForm.className = $event.detail.value),
        W: common_vendor.o(closeEditPopup),
        X: common_vendor.o(saveUserInfo),
        Y: common_vendor.sr(editPopup, "0f7520f0-11", {
          "k": "editPopup"
        }),
        Z: common_vendor.p({
          type: "center"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map

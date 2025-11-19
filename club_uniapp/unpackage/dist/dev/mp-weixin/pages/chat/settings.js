"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const utils_auth = require("../../utils/auth.js");
const utils_system = require("../../utils/system.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "settings",
  setup(__props) {
    const statusBarHeight = utils_system.getStatusBarHeight();
    const groupId = common_vendor.ref(null);
    const groupInfo = common_vendor.reactive({
      name: "",
      avatar: "",
      description: "",
      memberCount: 0,
      ownerId: null,
      clubId: null,
      createTime: null
    });
    const userInfo = utils_auth.getUser();
    const currentUserId = common_vendor.ref((userInfo == null ? void 0 : userInfo.id) ? Number(userInfo.id) : null);
    const userRole = common_vendor.ref(0);
    const isOwner = common_vendor.computed(() => {
      common_vendor.index.__f__("log", "at pages/chat/settings.vue:96", "[权限检查] currentUserId:", currentUserId.value, "ownerId:", groupInfo.ownerId);
      return currentUserId.value && groupInfo.ownerId && currentUserId.value === groupInfo.ownerId;
    });
    common_vendor.computed(() => userRole.value === 1 || userRole.value === 2);
    common_vendor.onLoad(async (options) => {
      common_vendor.index.__f__("log", "at pages/chat/settings.vue:103", "[群聊设置] 页面加载，参数:", options);
      if (options.id) {
        groupId.value = parseInt(options.id);
        await loadGroupInfo();
        await loadUserRole();
      }
    });
    const loadGroupInfo = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/chat/settings.vue:114", "[群聊设置] 开始加载群组信息, groupId:", groupId.value);
        const res = await api_api.chatAPI.getGroupDetail(groupId.value);
        common_vendor.index.__f__("log", "at pages/chat/settings.vue:116", "[群聊设置] 群组详情响应:", res);
        if (res.code === 200 && res.data) {
          Object.assign(groupInfo, res.data);
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:120", "[群聊设置] 群组信息加载成功:", groupInfo);
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:121", "[群聊设置] ownerId:", groupInfo.ownerId, "type:", typeof groupInfo.ownerId);
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:122", "[群聊设置] createTime:", groupInfo.createTime, "type:", typeof groupInfo.createTime);
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:123", "[群聊设置] 格式化后的时间:", formatDate(groupInfo.createTime));
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载群组信息失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/settings.vue:131", "[群聊设置] 加载群组信息失败:", error);
        common_vendor.index.showToast({
          title: "加载群组信息失败",
          icon: "none"
        });
      }
    };
    const loadUserRole = async () => {
      try {
        if (!groupInfo.clubId) {
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:144", "[群聊设置] clubId为空，无法获取角色");
          return;
        }
        const res = await api_api.apiModule.club.getUserRole(groupInfo.clubId);
        common_vendor.index.__f__("log", "at pages/chat/settings.vue:149", "[群聊设置] 用户角色响应:", res);
        if (res.code === 200 && res.data) {
          userRole.value = res.data.type || 0;
          common_vendor.index.__f__("log", "at pages/chat/settings.vue:153", "[群聊设置] 用户角色:", userRole.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/settings.vue:156", "[群聊设置] 加载用户角色失败:", error);
      }
    };
    const changeAvatar = () => {
      common_vendor.index.__f__("log", "at pages/chat/settings.vue:162", "[修改头像] isOwner:", isOwner.value, "currentUserId:", currentUserId.value, "ownerId:", groupInfo.ownerId);
      if (!isOwner.value) {
        common_vendor.index.showToast({
          title: "仅群主可修改头像",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const uploadRes = await api_api.apiModule.common.upload(tempFilePath);
            common_vendor.index.__f__("log", "at pages/chat/settings.vue:184", "[修改头像] 上传响应:", uploadRes);
            if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
              const updateRes = await api_api.chatAPI.updateGroupInfo(groupId.value, {
                avatar: uploadRes.data.url
              });
              common_vendor.index.__f__("log", "at pages/chat/settings.vue:191", "[修改头像] 更新响应:", updateRes);
              if (updateRes.code === 200) {
                groupInfo.avatar = uploadRes.data.url;
                common_vendor.index.showToast({
                  title: "头像修改成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: updateRes.msg || "修改失败",
                  icon: "none"
                });
              }
            } else {
              common_vendor.index.showToast({
                title: uploadRes.msg || "上传失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/chat/settings.vue:212", "[修改头像] 失败:", error);
            common_vendor.index.showToast({
              title: "修改失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    const quitGroup = () => {
      common_vendor.index.showModal({
        title: "退出群聊",
        content: "确定要退出该群聊吗？",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "退出中..." });
              const response = await api_api.chatAPI.quitGroup(groupId.value);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "已退出群聊",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateBack({ delta: 2 });
                }, 1500);
              } else {
                common_vendor.index.showToast({
                  title: response.msg || "退出失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/chat/settings.vue:253", "[退出群聊] 失败:", error);
              common_vendor.index.showToast({
                title: "退出失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const dismissGroup = () => {
      common_vendor.index.showModal({
        title: "解散群聊",
        content: "解散后，所有成员将被移出群聊。确定要解散该群聊吗？",
        confirmText: "确定解散",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "解散中..." });
              const response = await api_api.chatAPI.dismissGroup(groupId.value);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "群聊已解散",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateBack({ delta: 2 });
                }, 1500);
              } else {
                common_vendor.index.showToast({
                  title: response.msg || "解散失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/chat/settings.vue:296", "[解散群聊] 失败:", error);
              common_vendor.index.showToast({
                title: "解散失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const formatDate = (timestamp) => {
      if (!timestamp) {
        common_vendor.index.__f__("log", "at pages/chat/settings.vue:312", "[formatDate] timestamp为空");
        return "";
      }
      try {
        const time = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
        if (isNaN(time)) {
          common_vendor.index.__f__("error", "at pages/chat/settings.vue:321", "[formatDate] 无效的时间戳:", timestamp);
          return "";
        }
        const date = new Date(time);
        if (isNaN(date.getTime())) {
          common_vendor.index.__f__("error", "at pages/chat/settings.vue:329", "[formatDate] 无效的日期对象:", timestamp);
          return "";
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        common_vendor.index.__f__("log", "at pages/chat/settings.vue:338", "[formatDate] 输入:", timestamp, "输出:", formattedDate);
        return formattedDate;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/settings.vue:341", "[formatDate] 格式化失败:", error, "timestamp:", timestamp);
        return "";
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(statusBarHeight) + "px",
        b: common_vendor.p({
          title: "群聊设置",
          showBack: true
        }),
        c: groupInfo.avatar || "/static/images/default-group.png",
        d: isOwner.value
      }, isOwner.value ? {
        e: common_vendor.p({
          type: "camera-filled",
          size: "24",
          color: "#fff"
        })
      } : {}, {
        f: common_vendor.o(changeAvatar),
        g: isOwner.value
      }, isOwner.value ? {} : {}, {
        h: common_vendor.t(groupInfo.name || "加载中..."),
        i: common_vendor.p({
          type: "person-filled",
          size: "18",
          color: "#b13b7a"
        }),
        j: common_vendor.t(groupInfo.memberCount || 0),
        k: groupInfo.createTime
      }, groupInfo.createTime ? {
        l: common_vendor.p({
          type: "calendar-filled",
          size: "18",
          color: "#b13b7a"
        }),
        m: common_vendor.t(formatDate(groupInfo.createTime))
      } : {}, {
        n: groupInfo.description
      }, groupInfo.description ? {
        o: common_vendor.t(groupInfo.description)
      } : {}, {
        p: !isOwner.value
      }, !isOwner.value ? {
        q: common_vendor.p({
          type: "loop",
          size: "20",
          color: "#ff4d4f"
        }),
        r: common_vendor.o(quitGroup)
      } : {}, {
        s: isOwner.value
      }, isOwner.value ? {
        t: common_vendor.p({
          type: "trash-filled",
          size: "20",
          color: "#ff4d4f"
        }),
        v: common_vendor.o(dismissGroup)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d535d005"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/settings.js.map

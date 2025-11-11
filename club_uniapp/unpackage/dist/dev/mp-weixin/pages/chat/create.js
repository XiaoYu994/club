"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "create",
  setup(__props) {
    const formData = common_vendor.reactive({
      name: "",
      description: "",
      avatar: "",
      clubId: null,
      type: 0,
      // 0-公共群 1-部门群 2-管理员群
      allowNonMembers: false
    });
    const groupTypes = [
      { id: 0, name: "公共群" },
      { id: 1, name: "部门群" },
      { id: 2, name: "管理员群" }
    ];
    const typeIndex = common_vendor.ref(0);
    const selectedClub = common_vendor.reactive({
      id: null,
      name: ""
    });
    const clubList = common_vendor.ref([]);
    const clubSelectorPopup = common_vendor.ref(null);
    const isFormValid = common_vendor.computed(() => {
      return formData.name.trim() !== "" && selectedClub.id !== null;
    });
    common_vendor.onLoad(async () => {
      await loadUserClubs();
    });
    const loadUserClubs = async () => {
      try {
        const response = await api_api.clubAPI.getUserClubs();
        if (response.code === 1) {
          clubList.value = response.data || [];
          if (clubList.value.length === 1) {
            selectClub(clubList.value[0]);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/create.vue:170", "获取社团列表失败:", error);
        common_vendor.index.showToast({
          title: "获取社团列表失败",
          icon: "none"
        });
      }
    };
    const chooseAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uploadAvatar(tempFilePath);
        }
      });
    };
    const uploadAvatar = (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      common_vendor.index.uploadFile({
        url: "/api/user/upload/image",
        // 图片上传API
        filePath,
        name: "file",
        header: {
          "token": utils_auth.getToken()
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 1 && data.data) {
              formData.avatar = data.data.url;
            } else {
              common_vendor.index.showToast({
                title: data.msg || "上传失败",
                icon: "none"
              });
            }
          } catch (e) {
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    };
    const showClubSelector = () => {
      clubSelectorPopup.value.open("bottom");
    };
    const closeClubSelector = () => {
      clubSelectorPopup.value.close();
    };
    const selectClub = (club) => {
      selectedClub.id = club.id;
      selectedClub.name = club.name;
      formData.clubId = club.id;
      closeClubSelector();
    };
    const onTypeChange = (e) => {
      typeIndex.value = e.detail.value;
      formData.type = groupTypes[typeIndex.value].id;
    };
    const onSwitchChange = (e) => {
      formData.allowNonMembers = e.detail.value;
    };
    const submitForm = async () => {
      if (!isFormValid.value) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "创建中..."
      });
      try {
        const response = await api_api.chatAPI.createChatGroup(formData);
        if (response.code === 1) {
          common_vendor.index.showToast({
            title: "群组创建成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: `/pages/chat/room?id=${response.data.id}&name=${encodeURIComponent(response.data.name)}`
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "创建失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/create.vue:300", "创建群组失败:", error);
        common_vendor.index.showToast({
          title: "创建群组失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "创建群聊",
          showBack: true
        }),
        b: formData.name,
        c: common_vendor.o(($event) => formData.name = $event.detail.value),
        d: formData.description,
        e: common_vendor.o(($event) => formData.description = $event.detail.value),
        f: formData.avatar
      }, formData.avatar ? {
        g: formData.avatar
      } : {
        h: common_vendor.p({
          type: "camera",
          size: "24",
          color: "#999"
        })
      }, {
        i: common_vendor.o(chooseAvatar),
        j: selectedClub.name
      }, selectedClub.name ? {
        k: common_vendor.t(selectedClub.name)
      } : {}, {
        l: common_vendor.p({
          type: "arrowright",
          size: "18",
          color: "#999"
        }),
        m: common_vendor.o(showClubSelector),
        n: common_vendor.t(groupTypes[typeIndex.value].name),
        o: common_vendor.p({
          type: "arrowright",
          size: "18",
          color: "#999"
        }),
        p: common_vendor.o(onTypeChange),
        q: typeIndex.value,
        r: groupTypes,
        s: formData.allowNonMembers,
        t: common_vendor.o(onSwitchChange),
        v: common_vendor.o(submitForm),
        w: !isFormValid.value ? 1 : "",
        x: common_vendor.o(closeClubSelector),
        y: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        z: common_vendor.f(clubList.value, (club, k0, i0) => {
          return {
            a: club.logo || "/static/img/club-default.png",
            b: common_vendor.t(club.name),
            c: common_vendor.t(club.memberCount),
            d: club.id,
            e: common_vendor.o(($event) => selectClub(club), club.id)
          };
        }),
        A: common_vendor.sr(clubSelectorPopup, "e5be4731-4", {
          "k": "clubSelectorPopup"
        }),
        B: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e5be4731"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/create.js.map

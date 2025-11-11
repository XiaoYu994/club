"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
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
  __name: "editClub",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(20);
    const club = common_vendor.ref({ id: "", name: "", logo: "", description: "", type: 0, address: "", contact: "" });
    common_vendor.onMounted(async () => {
      statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight || 20;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      club.value.id = currentPage.options.id;
      try {
        const res = await proxy.$api.club.getClubDetail(club.value.id);
        if (res.code === 200) {
          Object.assign(club.value, res.data);
        } else {
          common_vendor.index.showToast({ title: res.message || "加载失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
      }
    });
    const uploadLogo = () => {
      common_vendor.index.chooseImage({ count: 1, sizeType: ["compressed"], sourceType: ["album", "camera"], success: (res) => {
        const path = res.tempFilePaths[0];
        common_vendor.index.showLoading({ title: "上传中..." });
        proxy.$api.common.upload(path).then((r) => {
          common_vendor.index.hideLoading();
          if (r.code === 200) {
            club.value.logo = utils_common.getImageUrl(r.data.url || r.data, "", false);
          } else {
            common_vendor.index.showToast({ title: r.message || "上传失败", icon: "none" });
          }
        }).catch(() => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "上传出错", icon: "none" });
        });
      } });
    };
    const submit = async () => {
      if (!club.value.name) {
        common_vendor.index.showToast({ title: "请输入名称", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const updateData = {
          name: club.value.name,
          logo: club.value.logo,
          description: club.value.description,
          type: club.value.type,
          address: club.value.address,
          contact: club.value.contact
        };
        const res = await proxy.$api.club.updateClub(club.value.id, updateData);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.redirectTo({ url: `/pages/club/detail?id=${club.value.id}` });
          }, 800);
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: "编辑社团",
          showBack: true
        }),
        d: club.value.name,
        e: common_vendor.o(($event) => club.value.name = $event.detail.value),
        f: club.value.logo
      }, club.value.logo ? {
        g: club.value.logo
      } : {
        h: common_vendor.p({
          type: "image",
          size: "50",
          color: "#999"
        })
      }, {
        i: common_vendor.o(uploadLogo),
        j: club.value.description,
        k: common_vendor.o(($event) => club.value.description = $event.detail.value),
        l: club.value.address,
        m: common_vendor.o(($event) => club.value.address = $event.detail.value),
        n: club.value.contact,
        o: common_vendor.o(($event) => club.value.contact = $event.detail.value),
        p: common_vendor.o(goBack),
        q: common_vendor.o(submit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83fcc81d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/editClub.js.map

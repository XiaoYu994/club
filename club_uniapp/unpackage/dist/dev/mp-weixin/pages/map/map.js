"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  _easycom_custom_nav_bar2();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
if (!Math) {
  _easycom_custom_nav_bar();
}
const imageUrl = "/static/images/map1.png";
const _sfc_main = {
  __name: "map",
  setup(__props) {
    function previewImage() {
      common_vendor.index.previewImage({
        urls: [imageUrl],
        current: imageUrl
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "校园导览",
          showBack: true
        }),
        b: common_assets._imports_0$1,
        c: common_vendor.o(previewImage)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e06b858f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/map.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
const api_api = require("../../api/api.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (CustomNavBar + _easycom_uni_icons)();
}
const CustomNavBar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const notice = common_vendor.ref(null);
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "";
      return utils_common.formatDate(Number(timestamp));
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const getNoticeDetail = async (id) => {
      try {
        const res = await api_api.apiModule.notice.getNoticeDetail(id);
        if (res.code === 200) {
          notice.value = res.data;
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "获取公告详情失败", icon: "none" });
      }
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      let id = null;
      if (current.options && current.options.id)
        id = current.options.id;
      else if (current.$route && current.$route.query.id)
        id = current.$route.query.id;
      if (id)
        getNoticeDetail(id);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "公告详情",
          backButton: true
        }),
        b: !notice.value
      }, !notice.value ? {} : common_vendor.e({
        c: common_vendor.t(notice.value.title),
        d: common_vendor.t(formatDateTime(notice.value.createTime)),
        e: notice.value.publisherName
      }, notice.value.publisherName ? {
        f: common_vendor.t(notice.value.publisherName)
      } : {}, {
        g: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999"
        }),
        h: common_vendor.t(notice.value.viewCount || 0),
        i: notice.value.coverImage
      }, notice.value.coverImage ? {
        j: notice.value.coverImage,
        k: common_vendor.o(($event) => previewImage(notice.value.coverImage))
      } : {}, {
        l: notice.value && notice.value.content
      }, notice.value && notice.value.content ? {
        m: notice.value.content
      } : {}));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f737f11"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/detail.js.map

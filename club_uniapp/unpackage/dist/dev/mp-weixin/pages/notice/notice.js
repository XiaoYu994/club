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
  __name: "notice",
  setup(__props) {
    const noticeList = common_vendor.ref([]);
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "";
      return utils_common.formatDate(Number(timestamp));
    };
    const getNoticeList = async () => {
      try {
        const res = await api_api.apiModule.notice.getNoticeList({ pageNo: 1, pageSize: 20, orderBy: "is_top", isAsc: false });
        if (res.code === 200) {
          noticeList.value = res.data.list || [];
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "获取公告失败", icon: "none" });
      }
    };
    const goDetail = (item) => {
      common_vendor.index.navigateTo({ url: `/pages/notice/detail?id=${item.id}` });
    };
    common_vendor.onMounted(() => {
      getNoticeList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "公告"
        }),
        b: noticeList.value.length === 0
      }, noticeList.value.length === 0 ? {} : {}, {
        c: common_vendor.f(noticeList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.isTop === 1
          }, item.isTop === 1 ? {
            b: "1c2e4c1e-1-" + i0,
            c: common_vendor.p({
              type: "star",
              size: "14",
              color: "#ff6b35"
            })
          } : {}, {
            d: common_vendor.t(item.title),
            e: common_vendor.t(formatDateTime(item.createTime)),
            f: item.publisherName
          }, item.publisherName ? {
            g: common_vendor.t(item.publisherName)
          } : {}, {
            h: "1c2e4c1e-2-" + i0,
            i: common_vendor.t(item.viewCount || 0),
            j: item.id,
            k: item.isTop === 1 ? 1 : "",
            l: common_vendor.o(($event) => goDetail(item), item.id)
          });
        }),
        d: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1c2e4c1e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/notice.js.map

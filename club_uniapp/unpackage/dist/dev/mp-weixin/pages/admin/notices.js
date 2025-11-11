"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
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
  __name: "notices",
  setup(__props) {
    const searchParams = common_vendor.reactive({
      keyword: "",
      page: 1,
      pageSize: 10
    });
    const noticeList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const refresherTriggered = common_vendor.ref(false);
    const handleSearch = () => {
      page.value = 1;
      noticeList.value = [];
      hasMore.value = true;
      loadNoticeList();
    };
    const navigateToCreate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/notices/edit"
      });
    };
    const loadNoticeList = async () => {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const params = {
          ...searchParams,
          page: page.value,
          orderBy: "is_top",
          isAsc: false
        };
        const response = await api_api.apiModule.admin.notice.getNotices(params);
        if (response.code === 200) {
          const { list, total, pageNum, pageSize } = response.data;
          if (page.value === 1) {
            noticeList.value = list || [];
          } else {
            noticeList.value = [...noticeList.value, ...list || []];
          }
          hasMore.value = noticeList.value.length < total;
        } else {
          common_vendor.index.showToast({
            title: response.message || "获取公告列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/notices.vue:167", "获取公告列表失败:", error);
        common_vendor.index.showToast({
          title: "获取公告列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
        refresherTriggered.value = false;
      }
    };
    const loadMore = () => {
      if (loading.value || !hasMore.value)
        return;
      page.value++;
      loadNoticeList();
    };
    const onRefresh = () => {
      refresherTriggered.value = true;
      page.value = 1;
      noticeList.value = [];
      hasMore.value = true;
      loadNoticeList();
    };
    const editNotice = (notice) => {
      common_vendor.index.navigateTo({
        url: `/pages/admin/notices/edit?id=${notice.id}`
      });
      common_vendor.index.__f__("log", "at pages/admin/notices.vue:206", "Editing notice with id:", notice.id);
    };
    const deleteNotice = (notice) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该公告吗？",
        success: async function(res) {
          if (res.confirm) {
            try {
              const response = await api_api.apiModule.admin.notice.deleteNotice(notice.id);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                const index = noticeList.value.findIndex((item) => item.id === notice.id);
                if (index !== -1) {
                  noticeList.value.splice(index, 1);
                }
              } else {
                common_vendor.index.showToast({
                  title: response.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/notices.vue:239", "删除公告失败:", error);
              common_vendor.index.showToast({
                title: "删除失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const toggleTopStatus = (notice) => {
      const newTopStatus = notice.isTop === 1 ? 0 : 1;
      const action = newTopStatus === 1 ? "置顶" : "取消置顶";
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要${action}该公告吗？`,
        success: async function(res) {
          if (res.confirm) {
            try {
              const response = await api_api.apiModule.admin.notice.updateTopStatus(notice.id, newTopStatus);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: `${action}成功`,
                  icon: "success"
                });
                notice.isTop = newTopStatus;
                if (newTopStatus === 1) {
                  onRefresh();
                }
              } else {
                common_vendor.index.showToast({
                  title: response.message || `${action}失败`,
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/notices.vue:286", `${action}公告失败:`, error);
              common_vendor.index.showToast({
                title: `${action}失败，请重试`,
                icon: "none"
              });
            }
          }
        }
      });
    };
    const getContentPreview = (content) => {
      if (!content)
        return "暂无内容";
      let plainText = content.replace(/<[^>]+>/g, "");
      plainText = plainText.replace(/\s+/g, " ").trim();
      return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
    };
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "--";
      const time = parseInt(timestamp);
      if (isNaN(time))
        return "--";
      const d = new Date(time);
      if (isNaN(d.getTime()))
        return "--";
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      const hour = d.getHours().toString().padStart(2, "0");
      const minute = d.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    };
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (!token) {
        common_vendor.index.reLaunch({
          url: "/pages/admin/login"
        });
        return;
      }
      loadNoticeList();
    });
    common_vendor.onShow(() => {
      if (noticeList.value.length > 0) {
        page.value = 1;
        noticeList.value = [];
        hasMore.value = true;
        refresherTriggered.value = false;
        loadNoticeList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "公告管理"
        }),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(handleSearch),
        d: searchParams.keyword,
        e: common_vendor.o(($event) => searchParams.keyword = $event.detail.value),
        f: common_vendor.o(handleSearch),
        g: loading.value && page.value === 1
      }, loading.value && page.value === 1 ? {
        h: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : common_vendor.e({
        i: common_vendor.f(noticeList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.isTop === 1
          }, item.isTop === 1 ? {
            b: "c72b822e-3-" + i0,
            c: common_vendor.p({
              type: "star",
              size: "14",
              color: "#ff6b35"
            })
          } : {}, {
            d: common_vendor.t(item.title),
            e: common_vendor.t(item.isTop === 1 ? "取消置顶" : "置顶"),
            f: item.isTop === 1 ? 1 : "",
            g: common_vendor.o(($event) => toggleTopStatus(item), item.id),
            h: common_vendor.o(($event) => editNotice(item), item.id),
            i: common_vendor.o(($event) => deleteNotice(item), item.id),
            j: common_vendor.t(getContentPreview(item.content)),
            k: common_vendor.t(formatDateTime(item.createTime)),
            l: common_vendor.t(item.publisherName || "管理员"),
            m: "c72b822e-4-" + i0,
            n: common_vendor.t(item.viewCount || 0),
            o: item.id,
            p: item.isTop === 1 ? 1 : ""
          });
        }),
        j: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999"
        }),
        k: noticeList.value.length === 0
      }, noticeList.value.length === 0 ? {
        l: common_vendor.p({
          type: "info",
          size: "40",
          color: "#999"
        })
      } : {}, {
        m: loading.value && page.value > 1
      }, loading.value && page.value > 1 ? {} : {}, {
        n: !loading.value && !hasMore.value && noticeList.value.length > 0
      }, !loading.value && !hasMore.value && noticeList.value.length > 0 ? {} : {}), {
        o: common_vendor.o(loadMore),
        p: refresherTriggered.value,
        q: common_vendor.o(onRefresh),
        r: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#fff"
        }),
        s: common_vendor.o(navigateToCreate)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c72b822e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/notices.js.map

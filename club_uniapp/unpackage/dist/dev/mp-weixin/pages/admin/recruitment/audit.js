"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_api = require("../../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "audit",
  setup(__props) {
    const statusOptions = [
      { label: "全部", value: -1 },
      { label: "待审核", value: 0 },
      { label: "已通过", value: 1 },
      { label: "已结束", value: 2 },
      { label: "已驳回", value: 3 }
    ];
    const auditList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refresherTriggered = common_vendor.ref(false);
    const currentStatus = common_vendor.ref(-1);
    const scrollTop = common_vendor.ref(0);
    const keyword = common_vendor.ref("");
    common_vendor.computed(() => {
      const kw = keyword.value.trim().toLowerCase();
      if (!kw)
        return auditList.value;
      return auditList.value.filter((item) => {
        const club = String(item.clubName || "").toLowerCase();
        const title = String(item.title || "").toLowerCase();
        const desc = String(item.description || "").toLowerCase();
        return club.includes(kw) || title.includes(kw) || desc.includes(kw);
      });
    });
    const onSearchConfirm = () => {
      scrollTop.value = 0;
      loadAuditList(true);
    };
    const clearKeyword = () => {
      keyword.value = "";
      scrollTop.value = 0;
      loadAuditList(true);
    };
    const auditForm = common_vendor.reactive({
      id: null,
      action: null,
      // 1=通过，3=驳回
      comment: ""
    });
    const auditPopup = common_vendor.ref(null);
    const loadAuditList = async (reset = false) => {
      if (reset) {
        currentPage.value = 1;
        auditList.value = [];
        hasMore.value = true;
        scrollTop.value = 0;
      }
      if (!hasMore.value || isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: currentPage.value,
          pageSize: pageSize.value
        };
        if (currentStatus.value !== -1) {
          params.status = currentStatus.value;
        }
        const kw = keyword.value.trim();
        if (kw) {
          params.keyword = kw;
        }
        const response = await api_api.apiModule.admin.recruitment.getAuditList(params);
        if (response.code === 200) {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
          const totalCount = Number(response.data.total) || 0;
          if (reset) {
            auditList.value = records;
          } else {
            const map = /* @__PURE__ */ new Map();
            auditList.value.forEach((item) => map.set(item.id, item));
            records.forEach((item) => map.set(item.id, item));
            auditList.value = Array.from(map.values());
          }
          total.value = totalCount;
          hasMore.value = auditList.value.length < total.value;
          currentPage.value = currentPage.value + 1;
        } else {
          common_vendor.index.showToast({
            title: response.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/audit.vue:265", "加载审核列表失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refresherTriggered.value = false;
      }
    };
    const changeStatus = (status) => {
      currentStatus.value = status;
      scrollTop.value = 0;
      loadAuditList(true);
    };
    const onRefresh = () => {
      refresherTriggered.value = true;
      scrollTop.value = 0;
      loadAuditList(true);
    };
    const loadMore = () => {
      if (!isLoading.value && hasMore.value) {
        loadAuditList();
      }
    };
    const getStatusText = (status) => {
      const statusMap = {
        "-1": "",
        0: "待审核",
        1: "已通过",
        2: "已结束",
        3: "已驳回"
      };
      return statusMap[status] || "未知";
    };
    const getStatusClass = (status) => {
      const classMap = {
        0: "status-pending",
        1: "status-approved",
        2: "status-ended",
        3: "status-rejected"
      };
      return classMap[status] || "";
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(parseInt(timestamp));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(parseInt(timestamp));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const showAuditModal = (item, action) => {
      auditForm.id = item.id;
      auditForm.action = action;
      auditForm.comment = "";
      auditPopup.value.open();
    };
    const closeAuditModal = () => {
      auditPopup.value.close();
      auditForm.id = null;
      auditForm.action = null;
      auditForm.comment = "";
    };
    const submitAudit = async () => {
      if (auditForm.action === 3 && !auditForm.comment.trim()) {
        common_vendor.index.showToast({
          title: "请输入驳回原因",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        const data = {
          id: auditForm.id,
          status: auditForm.action,
          reviewComment: auditForm.comment.trim()
        };
        const response = await api_api.apiModule.admin.recruitment.auditRecruitment(data);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: auditForm.action === 1 ? "审核通过" : "已驳回",
            icon: "success"
          });
          closeAuditModal();
          scrollTop.value = 0;
          loadAuditList(true);
        } else {
          common_vendor.index.showToast({
            title: response.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/audit.vue:396", "审核失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const confirmDelete = (item) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除“${item.title}”吗？此操作不可恢复。`,
        confirmText: "删除",
        confirmColor: "#f44336",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "删除中..." });
              const resp = await api_api.apiModule.admin.recruitment.deleteRecruitment(item.id);
              if (resp.code === 200) {
                auditList.value = auditList.value.filter((r) => r.id !== item.id);
                total.value = Math.max(0, total.value - 1);
                hasMore.value = auditList.value.length < total.value;
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
                if (!isLoading.value && hasMore.value && auditList.value.length === 0) {
                  loadAuditList();
                }
              } else {
                common_vendor.index.showToast({ title: resp.message || "删除失败", icon: "none" });
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/admin/recruitment/audit.vue:432", "删除失败：", e);
              common_vendor.index.showToast({ title: "网络异常，请稍后再试", icon: "none" });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const viewDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/admin/recruitment/detail?id=${item.id}`
      });
    };
    const getEmptyText = () => {
      if (currentStatus.value === -1) {
        return "暂无招新活动，试试更换关键字或筛选条件";
      }
      return `暂无${getStatusText(currentStatus.value)}的招新活动`;
    };
    common_vendor.onShow(() => {
      loadAuditList(true);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "招新活动审核"
        }),
        b: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        c: common_vendor.o(onSearchConfirm),
        d: keyword.value,
        e: common_vendor.o(($event) => keyword.value = $event.detail.value),
        f: keyword.value
      }, keyword.value ? {
        g: common_vendor.o(clearKeyword),
        h: common_vendor.p({
          type: "close",
          size: "18",
          color: "#bbb"
        })
      } : {}, {
        i: common_vendor.o(onSearchConfirm),
        j: common_vendor.f(statusOptions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: currentStatus.value === item.value ? 1 : "",
            c: item.value,
            d: common_vendor.o(($event) => changeStatus(item.value), item.value)
          };
        }),
        k: isLoading.value && currentPage.value === 1
      }, isLoading.value && currentPage.value === 1 ? {
        l: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : common_vendor.e({
        m: common_vendor.f(auditList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.clubName),
            b: common_vendor.t(item.title),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(getStatusClass(item.status)),
            e: common_vendor.t(item.description || "无"),
            f: common_vendor.t(formatDate(item.startTime)),
            g: common_vendor.t(formatDate(item.endTime)),
            h: common_vendor.t(item.planCount),
            i: item.needInterview
          }, item.needInterview ? {
            j: common_vendor.t(item.interviewPlace || "待定")
          } : {}, {
            k: common_vendor.t(formatDateTime(item.createTime)),
            l: item.reviewComment
          }, item.reviewComment ? {
            m: common_vendor.t(item.reviewComment)
          } : {}, {
            n: item.poster
          }, item.poster ? {
            o: item.poster,
            p: common_vendor.o(($event) => previewImage(item.poster), item.id)
          } : {}, {
            q: item.status === 0
          }, item.status === 0 ? {
            r: common_vendor.o(($event) => showAuditModal(item, 1), item.id),
            s: common_vendor.o(($event) => showAuditModal(item, 3), item.id),
            t: common_vendor.o(($event) => viewDetail(item), item.id),
            v: common_vendor.o(($event) => confirmDelete(item), item.id)
          } : {
            w: common_vendor.o(($event) => viewDetail(item), item.id),
            x: common_vendor.o(($event) => confirmDelete(item), item.id)
          }, {
            y: item.id
          });
        }),
        n: auditList.value.length === 0
      }, auditList.value.length === 0 ? {
        o: common_vendor.p({
          type: "info",
          size: "40",
          color: "#999"
        }),
        p: common_vendor.t(getEmptyText())
      } : {}, {
        q: isLoading.value && currentPage.value > 1
      }, isLoading.value && currentPage.value > 1 ? {} : {}, {
        r: !isLoading.value && !hasMore.value && auditList.value.length > 0
      }, !isLoading.value && !hasMore.value && auditList.value.length > 0 ? {} : {}), {
        s: common_vendor.o(loadMore),
        t: refresherTriggered.value,
        v: common_vendor.o(onRefresh),
        w: scrollTop.value,
        x: common_vendor.t(auditForm.action === 1 ? "通过审核" : "驳回申请"),
        y: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        z: common_vendor.o(closeAuditModal),
        A: common_vendor.t(auditForm.action === 1 ? "审核意见" : "驳回原因"),
        B: auditForm.action === 1 ? "请输入审核意见（可选）" : "请输入驳回原因",
        C: auditForm.comment,
        D: common_vendor.o(($event) => auditForm.comment = $event.detail.value),
        E: common_vendor.t(auditForm.comment.length),
        F: common_vendor.o(closeAuditModal),
        G: common_vendor.o(submitAudit),
        H: common_vendor.sr(auditPopup, "d4e6dd82-5", {
          "k": "auditPopup"
        }),
        I: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d4e6dd82"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/recruitment/audit.js.map

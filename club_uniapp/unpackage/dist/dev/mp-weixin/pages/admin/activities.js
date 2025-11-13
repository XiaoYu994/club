"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "activities",
  setup(__props) {
    const activities = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const searchKeyword = common_vendor.ref("");
    const confirmPopup = common_vendor.ref(null);
    const actionPopup = common_vendor.ref(null);
    const confirmDialogTitle = common_vendor.ref("");
    const confirmDialogContent = common_vendor.ref("");
    const currentActivity = common_vendor.ref(null);
    const confirmAction = common_vendor.ref("");
    const confirmStatus = common_vendor.ref(null);
    const actionButtons = common_vendor.ref([]);
    const statusMap = { 0: "取消", 1: "计划中", 2: "进行中", 3: "已结束" };
    const detailPopup = common_vendor.ref(null);
    const activityDetail = common_vendor.ref(null);
    function loadActivities() {
      api_api.apiModule.admin.activity.getActivities({
        pageNo: page.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      }).then((res) => {
        if (res.code === 200) {
          activities.value = res.data.list;
          total.value = res.data.total;
        }
      });
    }
    function prevPage() {
      if (page.value > 1) {
        page.value--;
        loadActivities();
      }
    }
    function nextPage() {
      if (page.value * pageSize.value < total.value) {
        page.value++;
        loadActivities();
      }
    }
    function showDeleteConfirm(activity) {
      confirmDialogTitle.value = "删除确认";
      confirmDialogContent.value = `确定要删除活动"${activity.title}"吗？此操作不可撤销。`;
      currentActivity.value = activity;
      confirmAction.value = "delete";
      confirmPopup.value.open();
    }
    function showChangeStatusConfirm(activity, status) {
      confirmDialogTitle.value = `${statusMap[status]}确认`;
      confirmDialogContent.value = `确定要将活动"${activity.title}"标记为${statusMap[status]}吗？`;
      currentActivity.value = activity;
      confirmAction.value = "status";
      confirmStatus.value = status;
      confirmPopup.value.open();
    }
    function handleConfirmAction() {
      if (!currentActivity.value)
        return;
      if (confirmAction.value === "delete") {
        deleteActivity(currentActivity.value);
      } else if (confirmAction.value === "status") {
        updateActivityStatus(currentActivity.value, confirmStatus.value);
      }
      confirmPopup.value.close();
    }
    function deleteActivity(activity) {
      api_api.apiModule.admin.activity.deleteActivity(activity.id).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          loadActivities();
        } else {
          common_vendor.index.showToast({
            title: res.message || "删除失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/activities.vue:272", "删除活动失败", err);
      });
    }
    function updateActivityStatus(activity, status) {
      const data = {
        activityId: activity.id,
        status
      };
      api_api.apiModule.admin.activity.updateActivityStatus(data).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "状态更新成功",
            icon: "success"
          });
          loadActivities();
        } else {
          common_vendor.index.showToast({
            title: res.message || "状态更新失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/activities.vue:306", "更新活动状态失败", err);
      });
    }
    function exportApplyList(activity) {
      common_vendor.index.showLoading({ title: "导出中..." });
      api_api.apiModule.activity.exportApplyList(activity.id).then((res) => {
        common_vendor.index.__f__("log", "at pages/admin/activities.vue:319", "【导出】后端返回结果:", res);
        if (res.code === 200) {
          const { url, fileName } = res.data;
          common_vendor.index.__f__("log", "at pages/admin/activities.vue:324", "【导出】文件URL:", url);
          common_vendor.index.__f__("log", "at pages/admin/activities.vue:325", "【导出】文件名:", fileName);
          common_vendor.index.downloadFile({
            url,
            success: (downloadRes) => {
              common_vendor.index.__f__("log", "at pages/admin/activities.vue:331", "【导出】downloadFile success:", downloadRes);
              if (downloadRes.statusCode === 200) {
                const tempFilePath = downloadRes.tempFilePath;
                common_vendor.index.__f__("log", "at pages/admin/activities.vue:335", "【导出】临时文件路径:", tempFilePath);
                common_vendor.index.hideLoading();
                common_vendor.index.openDocument({
                  filePath: tempFilePath,
                  showMenu: true,
                  fileType: "xlsx",
                  success: () => {
                    common_vendor.index.__f__("log", "at pages/admin/activities.vue:345", "【导出】打开文档成功");
                    common_vendor.index.showToast({ title: "导出成功", icon: "success" });
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/admin/activities.vue:349", "【导出】打开文档失败:", err);
                    common_vendor.index.showModal({
                      title: "提示",
                      content: "文件下载成功，但无法直接打开。错误: " + (err.errMsg || "未知错误"),
                      showCancel: true,
                      cancelText: "取消",
                      confirmText: "复制链接",
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          common_vendor.index.setClipboardData({
                            data: url,
                            success: () => {
                              common_vendor.index.showToast({ title: "链接已复制，可在浏览器中下载", icon: "none", duration: 2e3 });
                            }
                          });
                        }
                      }
                    });
                  }
                });
              } else {
                common_vendor.index.__f__("error", "at pages/admin/activities.vue:370", "【导出】下载失败，状态码:", downloadRes.statusCode);
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "下载文件失败", icon: "none" });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/admin/activities.vue:376", "【导出】downloadFile失败:", err);
              common_vendor.index.hideLoading();
              const isDomainError = err.errMsg && (err.errMsg.includes("downloadFile:fail") || err.errMsg.includes("domain") || err.errMsg.includes("not in domain list"));
              common_vendor.index.showModal({
                title: "导出提示",
                content: isDomainError ? "下载失败，可能是域名未配置。请在微信公众平台配置downloadFile合法域名，或复制链接在浏览器中下载。" : "下载失败: " + (err.errMsg || "未知错误") + "。是否复制链接？",
                confirmText: "复制链接",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    common_vendor.index.setClipboardData({
                      data: url,
                      success: () => {
                        common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          common_vendor.index.__f__("error", "at pages/admin/activities.vue:415", "【导出】接口返回错误:", res);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: res.message || "导出失败", icon: "none" });
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at pages/admin/activities.vue:420", "【导出】导出报名表失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "导出失败: " + (error.message || "未知错误"), icon: "none" });
      });
    }
    function showActionMenu(activity) {
      currentActivity.value = activity;
      const opts = [];
      if (activity.status === 1)
        opts.push({ text: "通过", value: "approve" });
      if (activity.status === 1)
        opts.push({ text: "取消", value: "cancel" });
      if (activity.status === 2) {
        opts.push({ text: "结束", value: "end" });
        opts.push({ text: "取消", value: "cancel" });
      }
      opts.push({ text: "查看详情", value: "detail" });
      opts.push({ text: "删除", value: "delete" });
      opts.push({ text: "导出报名名单", value: "export" });
      actionButtons.value = opts;
      actionPopup.value.open();
    }
    function handleActionMenuItem(btn) {
      switch (btn.value) {
        case "approve":
          showChangeStatusConfirm(currentActivity.value, 2);
          break;
        case "cancel":
          showChangeStatusConfirm(currentActivity.value, 0);
          break;
        case "end":
          showChangeStatusConfirm(currentActivity.value, 3);
          break;
        case "detail":
          showActivityDetail(currentActivity.value);
          break;
        case "delete":
          showDeleteConfirm(currentActivity.value);
          break;
        case "export":
          exportApplyList(currentActivity.value);
          break;
      }
      actionPopup.value.close();
    }
    function showActivityDetail(activity) {
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
      api_api.apiModule.admin.activity.getActivityDetail(activity.id).then((res) => {
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          activityDetail.value = res.data;
          detailPopup.value.open();
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取详情失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("warn", "at pages/admin/activities.vue:486", "API not implemented, using mock data", err);
        activityDetail.value = {
          ...activity,
          totalApplies: 50,
          pendingApplies: 10,
          approvedApplies: 35,
          rejectedApplies: 5,
          checkedInCount: 30,
          checkInRate: 85.71,
          memberCount: 20,
          nonMemberCount: 30
        };
        detailPopup.value.open();
      });
    }
    function closeDetailPopup() {
      detailPopup.value.close();
    }
    function formatTime(timestamp) {
      if (!timestamp)
        return "未设置";
      try {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString("zh-CN");
      } catch (error) {
        return "时间格式错误";
      }
    }
    common_vendor.onMounted(loadActivities);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "活动管理"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(loadActivities),
        e: common_vendor.f(activities.value, (activity, idx, i0) => {
          return {
            a: common_vendor.t((page.value - 1) * pageSize.value + idx + 1),
            b: common_vendor.t(activity.title),
            c: common_vendor.t(activity.clubName),
            d: common_vendor.t(statusMap[activity.status]),
            e: common_vendor.n("status-" + activity.status),
            f: common_vendor.o(($event) => showActionMenu(activity), activity.id),
            g: activity.id
          };
        }),
        f: common_vendor.o(prevPage),
        g: page.value === 1,
        h: common_vendor.t(page.value),
        i: common_vendor.o(nextPage),
        j: page.value * pageSize.value >= total.value,
        k: common_vendor.o(handleConfirmAction),
        l: common_vendor.o(($event) => _ctx.$refs.confirmPopup.close()),
        m: common_vendor.p({
          title: confirmDialogTitle.value,
          content: confirmDialogContent.value,
          ["before-close"]: true
        }),
        n: common_vendor.sr(confirmPopup, "541d4cf8-1", {
          "k": "confirmPopup"
        }),
        o: common_vendor.p({
          type: "dialog"
        }),
        p: common_vendor.f(actionButtons.value, (btn, idx, i0) => {
          return {
            a: common_vendor.t(btn.text),
            b: idx,
            c: common_vendor.o(($event) => handleActionMenuItem(btn), idx)
          };
        }),
        q: common_vendor.o(($event) => actionPopup.value.close()),
        r: common_vendor.sr(actionPopup, "541d4cf8-3", {
          "k": "actionPopup"
        }),
        s: common_vendor.p({
          type: "bottom",
          borderRadius: "8px"
        }),
        t: activityDetail.value
      }, activityDetail.value ? common_vendor.e({
        v: common_vendor.t(activityDetail.value.title),
        w: common_vendor.t(activityDetail.value.clubName || "未设置"),
        x: common_vendor.t(activityDetail.value.statusName || statusMap[activityDetail.value.status]),
        y: common_vendor.n("status-" + activityDetail.value.status),
        z: common_vendor.t(activityDetail.value.address || "未设置"),
        A: common_vendor.t(activityDetail.value.planCount || "不限"),
        B: common_vendor.t(formatTime(activityDetail.value.startTime)),
        C: common_vendor.t(formatTime(activityDetail.value.endTime)),
        D: common_vendor.t(activityDetail.value.totalApplies || 0),
        E: common_vendor.t(activityDetail.value.pendingApplies || 0),
        F: common_vendor.t(activityDetail.value.approvedApplies || 0),
        G: common_vendor.t(activityDetail.value.rejectedApplies || 0),
        H: common_vendor.t(activityDetail.value.checkedInCount || 0),
        I: common_vendor.t(activityDetail.value.checkInRate || 0),
        J: common_vendor.t(activityDetail.value.memberCount || 0),
        K: common_vendor.t(activityDetail.value.nonMemberCount || 0),
        L: activityDetail.value.description
      }, activityDetail.value.description ? {
        M: common_vendor.t(activityDetail.value.description)
      } : {}) : {}, {
        N: common_vendor.o(closeDetailPopup),
        O: common_vendor.sr(detailPopup, "541d4cf8-4", {
          "k": "detailPopup"
        }),
        P: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-541d4cf8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/activities.js.map
